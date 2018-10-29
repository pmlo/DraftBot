const {Command} = require('discord.js-commando');

module.exports = class ClearCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'clear',
      memberName: 'clear',
      group: 'moderation',
      aliases: ['purge','prune', 'delete','clean'],
      description: 'Supprimer des messages en masse',
      examples: ['clear 5'],
      guildOnly: true,
      args: [{
        key: 'amount',
        prompt: 'Combien de messages voulez vous supprimer de messages',
        min: 1,
        max: 100,
        type: 'integer'
      }],
      clientPermissions: ['MANAGE_MESSAGES'],
      userPermissions: ['MANAGE_MESSAGES']
    });
  }

  async run (msg, {amount}) {
    amount = amount === 100 ? 99 : amount;
    
    msg.channel.bulkDelete(amount).then(msgs => {
      msg.say(`\`${msgs.size + 1} messages supprimés\``).then(message => message.delete({timeout: 2000}))
    })
  }
};