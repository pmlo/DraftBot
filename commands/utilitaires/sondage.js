const {Command} = require('discord.js-commando');
const {MessageEmbed} = require('discord.js');
const {deleteCommandMessages} = require('../../utils.js');

module.exports = class QuoteCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'sondage',
      memberName: 'sondage',
      group: 'utilitaires',
      aliases: ['vote'],
      description: 'Lancer un sondage pour la communauté',
      examples: ['sondage Aimez vous les frites ?'],
      guildOnly: true,
      args: [
        {
          key: 'message',
          prompt: 'Quelle est l\'affirmation de votre sondage',
          type: 'string'
        }
      ]
    });
  }

  async run (msg, {message}) {
    deleteCommandMessages(msg);
    const emojis = ['✅','❌']

    const embed = new MessageEmbed()
    .setTitle(":newspaper: Sondage")
    .addField(message,`Ce sondage est proposé par ${msg.author}`)
    .setColor(0xcd6e57)
    .setFooter(msg.guild.name,msg.guild.iconURL({format: 'png'}))
    .setTimestamp()

    msg.embed(embed)
    .then(question => emojis.reduce((acc, emoji) => acc.then(() => question.react(emoji)),Promise.resolve()))
  }
}