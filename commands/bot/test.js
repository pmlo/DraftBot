const {Command} = require('discord.js-commando'); 

module.exports = class AvatarCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'test',
      memberName: 'test',
      group: 'bot',
      description: 'Permet de tester une commande',
      guildOnly: true,
    });
  }

  run (msg) {
    return msg.reply('nothing to test sorry')
  }
};