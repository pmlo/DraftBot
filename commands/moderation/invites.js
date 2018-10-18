const {Command} = require('discord.js-commando');
const {sendLogs} = require('../../utils.js');

module.exports = class InvitesCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'invites',
      memberName: 'invites',
      group: 'moderation',
      aliases: ['invitations','invs'],
      description: 'Autoriser ou Interdir les invitations vers d\'autres serveurs discord.',
      examples: ['invites'],
      guildOnly: true,
      userPermissions: ['ADMINISTRATOR']
    });
  }

  async run (msg) {
    let description;

    if (msg.guild.settings.get('invites') !== false) {
      msg.guild.settings.set('invites', false);
      description = `Les invitations vers d\'autres serveurs seront maintenant **interdites** et donc supprimés !`;
    }else{
      msg.guild.settings.set('invites',true);
      description = `Les invitations vers d\'autres serveurs seront maintenant **autorisés** !`;
    }

    return sendLogs(msg, description)
  }
};