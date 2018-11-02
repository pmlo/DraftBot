const {Command} = require('discord.js-commando'), 
  {MessageEmbed} = require('discord.js')

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

  run (msg, {message}) {
    msg.say(message)
    return msg.delete()
  }
};