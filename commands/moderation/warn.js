const { Command } = require('discord.js-commando');
const { warnUser,deleteCommandMessages } = require('../../utils.js');

module.exports = class WarnCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'warn',
      memberName: 'warn',
      group: 'moderation',
      aliases: ['warning','avertissement'],
      description: 'Warn un joueur',
      examples: ['warn DraftMan 1 Trop beau'],
      guildOnly: true,
      args: [
        {
          key: 'member',
          prompt: 'Quel membre voulez vous avertir ?',
          type: 'member'
        },
        {
          key: 'reason',
          prompt: 'Pour quelle raison souhaitez vous donner cet avertissement',
          type: 'string',
          default: ''
        }
      ],
      userPermissions: ['MANAGE_MESSAGES'] 
    });
  }

  run (msg, {member, reason}) {
    deleteCommandMessages(msg);
    warnUser(msg,member,reason);
  }
};