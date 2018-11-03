const {Command} = require('discord.js-commando');
const {MessageEmbed,Util} = require('discord.js');
const sqlite = require('sqlite');
const path = require('path');

module.exports = class QuoteCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'react',
      memberName: 'react',
      group: 'admin',
      aliases: ['ra'],
      description: 'Ajouter des roles à un message avec des réactions',
      examples: ['react 5554845515145714 '],
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

    const newEmoji = Util.parseEmoji(emoji)

    msg.delete()

    const selectEmoji = connexion => {
      return connexion.get(`SELECT * FROM "reacts" WHERE message='${message.id}' AND emoji='${newEmoji.id||newEmoji.name}' AND guild='${msg.guild.id}'`)
        .then(result => ({ connexion, result }))
    }
    sqlite.open(path.join(__dirname, '../../storage.sqlite'))
    .then(selectEmoji)
    .then(({ connexion, result }) => {
      msg.channel.messages.fetch(message.id).then(focusMsg=> {
        const embed = focusMsg.embeds[0];

        if (result) {
          const currentRole = msg.guild.roles.find(r => r.id === result.role)
          embed.setDescription(embed.description.replace(currentRole.name, role.name))
          connexion.run(`UPDATE "reacts" SET role= ${role.id} WHERE message='${message.id}' AND emoji='${newEmoji.id||newEmoji.name}' AND guild='${msg.guild.id}'`)
        } else {
          message.react(newEmoji.id||newEmoji.name)
          embed.setDescription(embed.description ? `${embed.description} | ${role.name}` : role.name);
          connexion.run(`INSERT INTO "reacts" (guild, message, emoji, role) VALUES (?, ?, ?, ?)`,[msg.guild.id, message.id, newEmoji.id||newEmoji.name, role.id])
        }
        focusMsg.edit('', {embed});
      })
    })
  
    const reactEmbed = new MessageEmbed()
    .setColor(0xcd6e57)
    .setAuthor(msg.author.username, msg.author.displayAvatarURL())
    .setDescription(`**Action:** L'émoji ${newEmoji.id ? `<:${newEmoji.name}:${newEmoji.id}>` : newEmoji.name} à été attributé au role ${role.name} sur le selectionneur de roles !`)
    .setTimestamp();

    return msg.embed(reactEmbed).then(actionMessage => actionMessage.delete({timeout: 8000}))
  }
};