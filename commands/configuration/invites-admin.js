const {Command} = require('discord.js-commando');
const {sendLogsBot,deleteCommandMessages} = require('../../utils.js');

module.exports = class InvitesAdminCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'invites-admin',
      memberName: 'invites-admin',
      group: 'configuration',
      aliases: ['invitations','invs','invites'],
      description: 'Autoriser ou Interdir les invitations vers d\'autres serveurs discord.',
      examples: ['invites-admin'],
      guildOnly: true,
      userPermissions: ['ADMINISTRATOR']
    });
  }

  async run (msg) {
    deleteCommandMessages(msg);
    let description;

    if (msg.guild.settings.get('invites') !== false) {
      msg.guild.settings.set('invites', false);
      description = `Les invitations vers d\'autres serveurs seront maintenant **interdites** et donc supprimés !`;
    }else{
      msg.guild.settings.set('invites',true);
      description = `Les invitations vers d\'autres serveurs seront maintenant **autorisés** !`;
    }

    return sendLogsBot(msg, description)
  }
};