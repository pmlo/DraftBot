const {Command} = require('discord.js-commando');

module.exports = class AvatarCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'say',
      memberName: 'say',
      group: 'utils',
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

  async run (msg, {message}) {
    await msg.say(message, {files: msg.attachments.map(a => a.proxyURL)})
    await msg.delete();
  }
};
