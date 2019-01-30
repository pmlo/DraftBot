const {Command} = require('discord.js-commando');

module.exports = class AvatarCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'say',
      memberName: 'say',
      group: 'utilitaires',
      aliases: ['dit','sayd'],
      description: 'Permet de faire parler le bot',
      examples: ['say C\'est moi le plus fort ! Harder, better, faster, stronger 🎶'],
      guildOnly: true,
      args: [
        {
          key: 'message',
          prompt: 'Quel message voulez-vous envoyer ?',
          type: 'string',
        }
      ]
    });
  }

  run (msg, {message}) {
    msg.say(message, {files: msg.attachments.map(a => a.proxyURL)})
    msg.delete();
  }
};
