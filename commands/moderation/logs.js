const {Command} = require('discord.js-commando');
const {sendLogs} = require('../../utils.js');

module.exports = class WelcomeCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'logs',
      memberName: 'logs',
      group: 'moderation',
      description: 'Définir le channel pour les logs du serveur.',
      examples: ['logs #logs'],
      guildOnly: true,
      args: [{
				key: 'channel',
				prompt: 'Quel salon voulez vous pour les logs',
        type: 'channel'
			}],
      userPermissions: ['ADMINISTRATOR']
    });
  }

  async run (msg, {channel}) {
    msg.guild.settings.set('logsChannel', channel);

    sendLogs(msg,`🎉 Les logs du serveurs seront maintenant envoyés dans \`#${channel.name}\` !`)
  }
};