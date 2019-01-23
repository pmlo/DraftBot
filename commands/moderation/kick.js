const {Command} = require('discord.js-commando');
const {sendLogsBot,deleteCommandMessages} = require('../../utils.js');

module.exports = class KickCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'kick',
      memberName: 'kick',
      group: 'moderation',
      description: 'Permet de renvoyer un membre du serveur',
      aliases: ['kicker','renvoyer'],
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
          prompt: 'Pour quelle raison voulez-vous renvoyer ce membre?',
          type: 'string'
        }
      ],
      clientPermissions: ['KICK_MEMBERS'],
      userPermissions: ['KICK_MEMBERS']
    });
  }

  async run (msg, {user,reason}) {
    deleteCommandMessages(msg);
    user.kick({ reason: reason })
    return sendLogsBot(msg, `Le membre ${user.tag} a été kick.\n**Raison:** ${reason}`)
  }
};