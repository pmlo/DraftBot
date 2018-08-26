const {Command} = require('discord.js-commando'), 
  {addRole} = require('../../utils.js')

module.exports = class AvatarCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'test',
      memberName: 'test',
      group: 'bot',
      description: 'Pemret de tester une commande',
      guildOnly: true,
    });
  }

  run (msg) {
    return addRole('Membre',msg.member)
  }
};