const {Command} = require('discord.js-commando');
const {MessageEmbed} = require('discord.js');
const fetch = require('node-fetch');
const {oneLine} = require('common-tags');
const {deleteCommandMessages} = require('../../utils.js');

module.exports = class MathsCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'maths',
      memberName: 'maths',
      group: 'utilitaires',
      aliases: ['calc','calculatrice','equation','math'],
      description: 'Résoudre une équation',
      examples: ['math PI * 3'],
      args: [
        {
          key: 'equation',
          prompt: 'Quelle équation souaitez-vous résoudre ?',
          type: 'string',
          parse: p => p.toLowerCase().replace(/x/gim, '*'),
        }
      ]
    });
  }

  async run (msg, {equation}) {
    deleteCommandMessages(msg);
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