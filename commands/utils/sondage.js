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
    .setDescription(":newspaper: Sondage")
    .addField(message,'Veuillez voter avec :white_check_mark: et :x:')
    .setColor(0xcd6e57)
    .setTimestamp()

    await msg.embed(embed)
    await msg.delete();
    await Promise.all(emojis.map(emoji => question.react(emoji)));
  }
}