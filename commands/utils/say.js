const {Command} = require('discord.js-commando');

module.exports = class AvatarCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'say',
      memberName: 'say',
      group: 'utils',
      aliases: ['dit','sayd'],
      description: 'Permet de faire parler le bot',
      examples: ['say DraftMan est le plus fort !'],
      guildOnly: true,
      args: [
        {
          key: 'message',
          prompt: 'Quel message voulez vous envoyer ?',
          type: 'string',
        }
      ]
    });
  }

  async run (msg, {message}) {
    await msg.delete();
    await msg.say(message)
  }
};