const {Command} = require('discord.js-commando');
const {sendLogsBot} = require('../../utils.js')

module.exports = class BanCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'ban',
      memberName: 'ban',
      group: 'moderation',
      description: 'Permet de bannir un membre',
      aliases: ['bannir'],
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
          type: 'integer',
          default: 0
        }
      ],
      clientPermissions: ['BAN_MEMBERS'],
      userPermissions: ['BAN_MEMBERS']
    });
  }

  async run (msg, {user,reason,jours}) {
    user.ban({ days: jours, reason: reason })
    return sendLogsBot(msg, `Le membre ${user.tag} a été bannis\n**Raison:** ${reason}`)
  }
};