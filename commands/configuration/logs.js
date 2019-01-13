const {Command} = require('discord.js-commando');
const {sendLogsBot,deleteCommandMessages} = require('../../utils.js');

module.exports = class LogsCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'logs',
      memberName: 'logs',
      group: 'configuration',
      description: 'Définir le channel pour les logs du serveur.',
      examples: ['logs #logs'],
      guildOnly: true,
      args: [{
				key: 'channel',
				prompt: 'Quel salon voulez vous pour les logs',
        type: 'channel',
        default: ''
			}],
      userPermissions: ['ADMINISTRATOR']
    });
  }

  async run (msg, {channel}) {
    deleteCommandMessages(msg);
    let description;

    if(channel) {
      msg.guild.settings.set('logsChannel', channel);
      description = `🎉 Les logs du serveurs seront maintenant envoyés dans \`#${channel.name}\` !`;
		}else{
      if (msg.guild.settings.get('logsMessage') !== true) {
        msg.guild.settings.set('logsMessage',true);
        description = `🎉 Les logs du serveurs sont maintenant **activés** !`;
      }else{
        msg.guild.settings.set('logsMessage', false);
        description = `🎉 Les logs du serveurs sont maintenant **désactivés** !`;
      }
    }

    sendLogsBot(msg,description)
  }
};