const {Command} = require('discord.js-commando'),
      {MessageEmbed} = require('discord.js')

module.exports = class QuoteCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'quote',
      memberName: 'quote',
      group: 'utils',
      aliases: ['recup','cite'],
      description: 'Citer un message envoyé',
      examples: ['quote 5554845515145714'],
      guildOnly: true,
      args: [
        {
          key: 'message',
          prompt: 'Quel message voulez vous citez',
          type: 'message'
        },
        {
          key: 'member',
          prompt: 'A quel membre voulez vous citerle message ?',
          type: 'member',
          default: ''
        }
      ]
    });
  }

  async run (msg, {message,member}) {
    const embed = new MessageEmbed()
    .setAuthor(`${msg.author.username} cite:`, msg.author.displayAvatarURL())
    .setColor(0xcd6e57)
    .setDescription(message)
    .setTimestamp()
    .setFooter(`Dans #${message.channel.name}`, message.author.displayAvatarURL())

    msg.delete()
    
    return msg.say(member ? member.user: '',embed)
  }
};