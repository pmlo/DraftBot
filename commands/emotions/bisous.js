const {Command} = require('discord.js-commando');
const fetch = require('node-fetch')
const {MessageEmbed} = require('discord.js');
const {deleteCommandMessages} = require('../../utils.js');

module.exports = class AvatarCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'bisous',
      memberName: 'bisous',
      group: 'emotions',
      aliases: ['kiss'],
      description: 'Permet d\'envoyer des bisous à quelqu\'un.',
      examples: ['bisous @DraftMan'],
      args: [
        {
          key: 'member',
          prompt: 'A qui voulez vous donner un bisous ?',
          type: 'member',
          default: ''
        } 
      ]
    });
  }

  async run (msg, {member}) {
    deleteCommandMessages(msg);

    try {

      const kissFetch = await fetch('https://nekos.life/api/v2/img/kiss');
      const kissImg = await kissFetch.json();
      if (member.id === msg.member.id) member = null;

      const embed = new MessageEmbed()
      .setColor(0xcd6e57)
      .setDescription(member
        ? `${member.displayName}! Vous recevez un bisous de ${msg.member.displayName} 💖!`
        : `${msg.member.displayName} tu dois te sentir seule... Je te fais un gros bisous 💋`)
      .setImage(kissImg.url)

      return msg.embed(embed,member ? member : msg.author);

    } catch (error) {
        console.log('Bisous',error)
    }
  }
};