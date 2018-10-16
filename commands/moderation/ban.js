const {Command} = require('discord.js-commando');

module.exports = class BanCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'ban',
      memberName: 'ban',
      group: 'moderation',
      description: 'Permet de bannir un membre',
      examples: ['ban DraftMan'],
      guildOnly: true,
      args: [
        {
          key: 'user',
          prompt: 'Quel membre voulez vous banir',
          type: 'member'
        },
        {
          key: 'reason',
          prompt: 'Pour quelle raison voulez vous banir ce membre?',
          type: 'string'
        },
        {
          key: 'jours',
          prompt: 'Combien de jours?',
          type: 'integger',
          default: 0
        }
      ],
      clientPermissions: ['BAN_MEMBERS'],
      userPermissions: ['BAN_MEMBERS']
    });
  }

  async run (msg, {user,reason,jours}) {
    return user.ban({ days: jours, reason: reason })
  }
};