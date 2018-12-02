const {Command} = require('discord.js-commando');
const {MessageEmbed,Util} = require('discord.js');
const sqlite = require('sqlite');
const path = require('path');
const Database = require('better-sqlite3');

module.exports = class QuoteCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'remove-react',
      memberName: 'remove-react',
      group: 'admin',
      description: 'Retirer un role à un message react',
      examples: ['remove-react 5554845515145714 🖊 '],
      guildOnly: true,
      args: [
        {
          key: 'message', 
          prompt: 'A quel message souhaitez vous ajouter un role ?',
          type: 'message'
        },
        {
          key: 'emoji',
          prompt: 'Quel emoji doit apparaitre sous le message ?',
          type: 'string'
        }
      ]
    });
  }

  async run (msg, {emoji,message}) {
    const db = new Database(path.join(__dirname, '../../storage.sqlite'));
    const newEmoji = Util.parseEmoji(emoji)

    msg.delete()

    const result = db.prepare(`SELECT * FROM "reacts" WHERE message='${message.id}' AND emoji='${newEmoji.id||newEmoji.name}' AND guild='${msg.guild.id}'`).get()

    msg.channel.messages.fetch(message.id).then(focusMsg=> {
      const embed = focusMsg.embeds[0];

      if (!result) {
        return msg.reply('Impossible de trouver cette réaction !')
      }
      
      const currentRole = msg.guild.roles.find(r => r.id === result.role)
      if(embed.description.includes(`| ${currentRole.name}`)) embed.setDescription(embed.description.replace(`| ${currentRole.name}`, ''))
      
      else if(embed.description.includes(`${currentRole.name} |`)) embed.setDescription(embed.description.replace(`${currentRole.name} |`, ''))

      else if(embed.description.includes(currentRole.name)) embed.setDescription(embed.description.replace(currentRole.name, ''))
        // if(newEmoji.id){ 
        //   focusMsg.reactions.sweep(react => react.emoji.id === newEmoji.id)
        //   console.log(1)
        // }else{
        //   console.log(2)
        //   const users = focusMsg.reactions.find(react => react.emoji.name === newEmoji.name).users;
        //   const test = users.each(user => users.remove(user))

        //   console.log(test)
        //   // focusMsg.reactions.sweep(react => react.emoji.name === newEmoji.name)
        // }
      db.prepare(`DELETE FROM "reacts" WHERE message='${message.id}' AND emoji='${newEmoji.id||newEmoji.name}' AND guild='${msg.guild.id}'`).run()
      focusMsg.edit('', {embed});
    })
  
    const reactEmbed = new MessageEmbed()
    .setColor(0xcd6e57)
    .setAuthor(msg.author.username, msg.author.displayAvatarURL())
    .setDescription(`**Action:** L'émoji ${newEmoji.id ? `<:${newEmoji.name}:${newEmoji.id}>` : newEmoji.name} à été supprimé sur le selectionneur de roles !`)
    .setTimestamp();

    return msg.embed(reactEmbed).then(actionMessage => actionMessage.delete({timeout: 8000}))
  }
};