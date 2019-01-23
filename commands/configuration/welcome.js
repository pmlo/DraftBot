const {Command} = require('discord.js-commando');
const {sendLogsBot,deleteCommandMessages} = require('../../utils.js');

module.exports = class WelcomeCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'welcome',
      memberName: 'welcome',
      group: 'configuration',
      aliases: ['bvn','bienvenue'],
      description: 'Activer ou désactiver le message de bienvenue sur le serveur.',
      examples: ['welcome'],
      guildOnly: true,
      args: [{
				key: 'channel',
				prompt: 'Quel salon voulez-vous utiliser pour les messages de bienvenue ?',
        type: 'channel',
        default: ''
			}],
      userPermissions: ['ADMINISTRATOR']
    });
  }

  async run (msg, args) {
    deleteCommandMessages(msg);
    let description;

    if(args.channel) {
      msg.guild.settings.set('welcomeChannel', args.channel);
      description = `🎉 Le salon pour les messages de bienvenue est maintenant \`#${args.channel.name}\` !`;
		}else{
      if (msg.guild.settings.get('welcomeMessage') !== false) {
        msg.guild.settings.set('welcomeMessage', false);
        description = `🎉 Les messages de bienvenue sont maintenant **désactivés** !`;
      }else{
        msg.guild.settings.set('welcomeMessage',true);
        description = `🎉 Les messages de bienvenue sont maintenant **activés** !`;
      }
    }

    return sendLogsBot(msg, description)
  }
};