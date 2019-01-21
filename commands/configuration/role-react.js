const {Command} = require('discord.js-commando');
const {MessageEmbed,Util} = require('discord.js');
const Database = require('better-sqlite3');
const path = require('path');
const {deleteCommandMessages} = require('../../utils.js');

module.exports = class ReactCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'role-react',
      memberName: 'role-react',
      group: 'configuration',
      aliases: ['react-role'],
      description: 'Ajouter des roles à un message avec des réactions',
      examples: ['role-react 5554845515145714 Graphiste 🖊'],
      guildOnly: true,
      args: [
        {
          key: 'message',
          prompt: 'A quel message souhaitez vous ajouter un role ?',
          type: 'message'
        },
        {
          key: 'role',
          prompt: 'Quel role doit être ajouté lors d\'une interaction avec une réaction',
          type: 'role'
        },
        {
          key: 'emoji',
          prompt: 'Quel emoji doit apparaitre sous le message ?',
          type: 'string'
        }
      ]
    });
  }

  async run (msg, {emoji,role,message}) {
    deleteCommandMessages(msg);
    const db = new Database(path.join(__dirname, '../../storage.sqlite'));
    const newEmoji = Util.parseEmoji(emoji)

    const result = db.prepare(`SELECT * FROM "reacts" WHERE message='${message.id}' AND emoji='${newEmoji.id||newEmoji.name}' AND guild='${msg.guild.id}'`).get()

    const focusMsg = await msg.channel.messages.fetch(message.id)
    
    const embedBoo = focusMsg.embeds.length > 0 ? true : false;
    const embed = focusMsg.embeds[0];
    const reactEmbed = new MessageEmbed()
    .setColor(0xcd6e57)
    .setAuthor(msg.author.username, msg.author.displayAvatarURL())
    .setTimestamp();

    if (result) {
      const currentRole = msg.guild.roles.find(r => r.id === result.role)

      if(currentRole.name === role.name){
        //SUPPRIMER
        db.prepare(`DELETE FROM "reacts" WHERE message='${message.id}' AND emoji='${newEmoji.id||newEmoji.name}' AND guild='${msg.guild.id}'`).run()

        if(newEmoji.id){
          const users = focusMsg.reactions.find(react => react.emoji.name === newEmoji.name).users;
          users.each(user => users.remove(user))
        }else{
          const users = focusMsg.reactions.find(react => react.emoji.id === newEmoji.id).users;
          users.each(user => users.remove(user))
        }

        if(embedBoo) {
          const roles = embed.description ? embed.description.split('\n') : [];
          const description = roles.filter(r => r.split(' | ')[1] !== currentRole.name).join('\n')
          embed.setDescription(description);
        }
        reactEmbed.setDescription(`**Action:** L'émoji ${newEmoji.id ? `<:${newEmoji.name}:${newEmoji.id}>` : newEmoji.name} viens d'être supprimé pour le role ${role.name} sur le selectionneur de roles !`)
      }else{
        //UPDATE
        db.prepare(`UPDATE "reacts" SET role= ${role.id} WHERE message='${message.id}' AND emoji='${newEmoji.id||newEmoji.name}' AND guild='${msg.guild.id}'`).run()
        

        if(embedBoo) {
          const roles = embed.description ? embed.description.split('\n') : [];
          const description = roles.filter(r => r.split(' | ')[1] !== currentRole.name).join('\n')
          roles.push(`${newEmoji.id ? `<:${newEmoji.name}:${newEmoji.id}>` : newEmoji.name} | ${role.name}\n`)
          embed.setDescription(description);
        }

        if(embedBoo) embed.setDescription(embed.description.replace(currentRole.name, role.name))
        reactEmbed.setDescription(`**Action:** L'émoji ${newEmoji.id ? `<:${newEmoji.name}:${newEmoji.id}>` : newEmoji.name} viens de remplacer l'ancien pour le role ${role.name} sur le selectionneur de roles !`)
      }
    } else {
      //AJOUTER
      message.react(newEmoji.id||newEmoji.name)
      
      db.prepare(`INSERT INTO "reacts" (guild, message, emoji, role) VALUES ($guild, $message, $emoji, $role)`).run({
        guild: msg.guild.id, 
        message: message.id, 
        emoji: newEmoji.id||newEmoji.name,
        role: role.id
      })

      if(embedBoo) {
        const roles = embed.description ? embed.description.split('\n') : [];
        roles.push(`${newEmoji.id ? `<:${newEmoji.name}:${newEmoji.id}>` : newEmoji.name} | ${role.name}\n`)
        embed.setDescription(`\n${roles.join('\n')}`);
      }
  
      reactEmbed.setDescription(`**Action:** L'émoji ${newEmoji.id ? `<:${newEmoji.name}:${newEmoji.id}>` : newEmoji.name} à été attributé au role ${role.name} sur le selectionneur de roles !`)
    }
    if(embedBoo) focusMsg.edit('', {embed});
    return msg.embed(reactEmbed).then(actionMessage => actionMessage.delete({timeout: 8000}))
  }
};