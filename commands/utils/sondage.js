const {Command} = require('discord.js-commando');
const {MessageEmbed} = require('discord.js');

module.exports = class QuoteCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'sondage',
      memberName: 'sondage',
      group: 'utils',
      aliases: ['vote'],
      description: 'Lancer un sondage pour la communauté',
      examples: ['sondage Aimez vous les frites ?'],
      guildOnly: true,
      args: [
        {
          key: 'message',
          prompt: 'Quel est l\'affirmation de votre sondage',
          type: 'string'
        }
      ]
    });
  }

  async run (msg, {message}) {
    const emojis = ['✅','❌']

    const embed = new MessageEmbed()
    .setTitle(":newspaper: Sondage")
    .addField(message,`Ceci est un sondage proposé par ${msg.author}`)
    .setColor(0xcd6e57)
    .setFooter(msg.guild.name,msg.guild.iconURL({format: 'png'}))
    .setTimestamp()

    msg.embed(embed)
    .then(question => emojis.reduce((acc, emoji) => acc.then(() => question.react(emoji)),Promise.resolve()))
    
    msg.delete();
  }
}