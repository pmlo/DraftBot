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
        type: 'channel',
        default: ''
			}],
      userPermissions: ['ADMINISTRATOR']
    });
  }

  async run (msg, {channel}) {

    let description;

    if(args.channel) {
      msg.guild.settings.set('logsChannel', args.channel);
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

    sendLogs(msg,description)
  }
};