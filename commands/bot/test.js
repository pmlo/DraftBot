const {Command} = require('discord.js-commando'),
      {error} = require('../../utils.js')

module.exports = class TestCommand extends Command {
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
    return msg.reply(error('Nothing to test sorry.'));
  }
};