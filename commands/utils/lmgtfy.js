const {Command} = require('discord.js-commando');
const {MessageEmbed} = require('discord.js');
const {deleteCommandMessages} = require('../../utils.js');

module.exports = class AvatarCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'lmgtfy',
      memberName: 'lmgtfy',
      group: 'utils',
      aliases: ['google','search','recherche'],
      description: 'Permet d\'envoyer un lien lmgtfy.',
      examples: ['lmgtfy Comment trouver des réponses soit même'],
      args: [
        {
          key: 'search',
          prompt: 'Quelle recherche voulez-vous ?',
          type: 'string'
        }
      ]
    });
  }

  run (msg, {member, search}) {

    deleteCommandMessages(msg);

    const question = search.split(' ').filter(val => val !== '').join('+');

    const embed = new MessageEmbed()
      .setColor(0xcd6e57)
      .setTitle(member.user.username)
      .setURL(`https://www.lmgtfy.com/?q=${question}`)
      .setDescription(`voici la solution à [ta question](https://www.lmgtfy.com/?q=${question}), c'est de la part de ${msg.author}, il pense que cela pourrais t'aider !`);

    return msg.embed(embed);
  }
};