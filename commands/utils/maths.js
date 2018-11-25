const {Command} = require('discord.js-commando')
const {MessageEmbed} = require('discord.js')
const fetch = require('node-fetch')
const {oneLine} = require('common-tags')

module.exports = class AvatarCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'maths',
      memberName: 'maths',
      group: 'utils',
      aliases: ['calc','calculatrice','equation','math'],
      description: 'Résoudre une équation',
      examples: ['math PI * 3'],
      args: [
        {
          key: 'equation',
          prompt: 'Quelle équation souaitez vous résoudre ?',
          type: 'string',
          parse: p => p.toLowerCase().replace(/x/gim, '*'),
        }
      ]
    });
  }

  async run (msg, {equation}) {

    const calculator = await fetch('http://api.mathjs.org/v4/', {
      body: JSON.stringify({ expr: equation }),
      method: 'POST',
    });
    const maths = await calculator.json();

    const mathEmbed = new MessageEmbed()
    .setTitle('Calculatrice')
    .setColor(0xcd6e57)
    .setDescription(oneLine`La réponse à \`${equation.toString()}\` est \`${maths.result}\``)
    .setFooter(msg.guild ? msg.guild.name : '',msg.guild ? msg.guild.iconURL({format: 'png'}) : msg.client.user.avatarURL({format: 'png'}))
    .setTimestamp()

    return msg.embed(mathEmbed);
  }
};