const {Command} = require('discord.js-commando');
const fetch = require('node-fetch')
const {MessageEmbed} = require('discord.js');
const {deleteCommandMessages} = require('../../utils.js');

module.exports = class AvatarCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'calin',
      memberName: 'calin',
      group: 'emotions',
      aliases: ['hug'],
      description: 'Permet d\'envoyer un calin à quelqu\'un.',
      examples: ['calin @DraftMan'],
      args: [
        {
          key: 'member',
          prompt: 'A qui voulez vous donner un câlin ?',
          type: 'member',
          default: ''
        }
      ]
    });
  }

  async run (msg, {member}) {
    deleteCommandMessages(msg);

    try {

      const hugFetch = await fetch('https://nekos.life/api/v2/img/hug');
      const hugImg = await hugFetch.json();
      if (member.id === msg.member.id) member = null;

      const embed = new MessageEmbed()
      .setColor(0xcd6e57)
      .setDescription(member
        ? `${member.displayName}! Vous recevez un câlin de ${msg.member.displayName} 💖!`
        : `${msg.member.displayName} tu dois te sentir seule... Je te fais un gros câlin 💖`)
      .setImage(hugImg.url)

      return msg.embed(embed,member ? member : msg.author);

    } catch (error) {
      console.log('Calin',error)
    }
  }
};