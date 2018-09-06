const {Command} = require('discord.js-commando'),
      {MessageEmbed} = require('discord.js')

module.exports = class PurgeCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'quote',
      memberName: 'quote',
      group: 'moderation',
      aliases: ['recup','cite'],
      description: 'Citer un message envoyé',
      examples: ['!quote 5554845515145714'],
      guildOnly: true,
      args: [
        {
          key: 'message',
          prompt: 'Quel message voulez vous citez',
          type: 'message'
        }
      ]
    });
  }

  async run (msg, {message}) {
    const embed = new MessageEmbed()
    .setAuthor(`${msg.author.username} cite:`, msg.author.displayAvatarURL())
    .setColor(0xcd6e57)
    .setDescription(message)
    .setTimestamp(message.createdAt)
    .setFooter(`Dans #${message.channel.name}`, message.author.displayAvatarURL())
    return msg.reply(embed)
  }
};