const {Command} = require('discord.js-commando');
const {sendLogs} = require('../../utils.js');

module.exports = class LogsCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'logs',
      memberName: 'logs',
      group: 'admin',
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

    const embed = new MessageEmbed()
    .setColor(0xcd6e57)
    .setAuthor(msg.author.username, msg.author.displayAvatarURL())
    .setDescription(stripIndents`**Action:** ${description}`)
    .setFooter(msg.guild.name)
    .setTimestamp();

    msg.say(embed).then(message => message.delete({timeout: 2000}))

    return sendLogs(msg,description)
  }
};