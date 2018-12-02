const {Command} = require('discord.js-commando');
const {MessageEmbed,Util} = require('discord.js');
const Database = require('better-sqlite3');
const path = require('path');

module.exports = class QuoteCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'react',
      memberName: 'react',
      group: 'admin',
      aliases: ['ra'],
      description: 'Ajouter des roles à un message avec des réactions',
      examples: ['react 5554845515145714 Graphiste 🖊'],
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
    const db = new Database(path.join(__dirname, '../../storage.sqlite'));
    const newEmoji = Util.parseEmoji(emoji)

    msg.delete()

    const result = db.prepare(`SELECT * FROM "reacts" WHERE message='${message.id}' AND emoji='${newEmoji.id||newEmoji.name}' AND guild='${msg.guild.id}'`).get()

    msg.channel.messages.fetch(message.id).then(focusMsg=> {
      const embed = focusMsg.embeds[0];

      if (result) {
        const currentRole = msg.guild.roles.find(r => r.id === result.role)
        embed.setDescription(embed.description.replace(currentRole.name, role.name))
        db.prepare(`UPDATE "reacts" SET role= ${role.id} WHERE message='${message.id}' AND emoji='${newEmoji.id||newEmoji.name}' AND guild='${msg.guild.id}'`).run()
      } else {
        message.react(newEmoji.id||newEmoji.name)
        embed.setDescription(embed.description ? `${embed.description} | ${role.name}` : role.name);
        db.prepare(`INSERT INTO "reacts" (guild, message, emoji, role) VALUES ($guild, $message, $emoji, $role)`).run({
          guild: msg.guild.id, 
          message: message.id, 
          emoji: newEmoji.id||newEmoji.name,
          role: role.id
        })
      }
      focusMsg.edit('', {embed});
    })
  
    const reactEmbed = new MessageEmbed()
    .setColor(0xcd6e57)
    .setAuthor(msg.author.username, msg.author.displayAvatarURL())
    .setDescription(`**Action:** L'émoji ${newEmoji.id ? `<:${newEmoji.name}:${newEmoji.id}>` : newEmoji.name} à été attributé au role ${role.name} sur le selectionneur de roles !`)
    .setTimestamp();

    return msg.embed(reactEmbed).then(actionMessage => actionMessage.delete({timeout: 8000}))
  }
};