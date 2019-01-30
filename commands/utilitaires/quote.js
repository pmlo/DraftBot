const {Command} = require('discord.js-commando');
const {MessageEmbed} = require('discord.js');
const {deleteCommandMessages} = require('../../utils.js');

module.exports = class QuoteCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'quote',
      memberName: 'quote',
      group: 'utilitaires',
      aliases: ['recup','cite'],
      description: 'Citer un message envoyé',
      examples: ['quote 5554845515145714'],
      guildOnly: true,
      args: [
        {
          key: 'message',
          prompt: 'Quel message voulez-vous citez',
          type: 'message'
        },
        {
          key: 'member',
          prompt: 'A quel membre voulez-vous citer le message ?',
          type: 'member',
          default: ''
        }
      ]
    });
  }

  async run (msg, {message,member}) {
    deleteCommandMessages(msg);
    const embed = new MessageEmbed()
    .setAuthor(`${msg.author.username} cite:`, msg.author.displayAvatarURL())
    .setColor(0xcd6e57)
    .setDescription(message)
    .setTimestamp()
    .setFooter(`Dans #${message.channel.name}`, message.author.displayAvatarURL())
    
    return msg.say(member ? member.user: '',embed)
  }
};