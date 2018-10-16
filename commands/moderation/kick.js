const {Command} = require('discord.js-commando');

module.exports = class KickCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'kick',
      memberName: 'kick',
      group: 'moderation',
      description: 'Permet de kick un membre',
      examples: ['kick DraftMan'],
      guildOnly: true,
      args: [
        {
          key: 'user',
          prompt: 'Quel membre voulez vous kick',
          type: 'member'
        },
        {
          key: 'reason',
          prompt: 'Pour quelle raison voulez vous kick ce membre?',
          type: 'string'
        }
      ],
      clientPermissions: ['KICK_MEMBERS'],
      userPermissions: ['KICK_MEMBERS']
    });
  }

  async run (msg, {user,reason}) {
    return user.kick({ reason: reason })
  }
};