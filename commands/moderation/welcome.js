const {Command} = require('discord.js-commando'),
      {MessageEmbed} = require('discord.js'),
      {oneLine, stripIndents} = require('common-tags');

module.exports = class WelcomeCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'welcome',
      memberName: 'welcome',
      group: 'moderation',
      aliases: ['bvn','bienvenue'],
      description: 'Activer ou désactiver le message de bienvenue sur le serveur.',
      examples: ['welcome'],
      guildOnly: true,
      args: [{
				key: 'channel',
				prompt: 'Quel prefix voulez vous pour le bot',
        type: 'channel',
        default: ''
			}],
      userPermissions: ['ADMINISTRATOR']
    });
  }

  async run (msg, args) {
    const defWelcomeEmbed = new MessageEmbed();
    let description;

    if(args.channel) {
      msg.guild.settings.set('welcomeChannel', args.channel);
      description = oneLine`🎉 Le salon pour les messages de bienvenue est maintenant \`#${args.channel.name}\` !`;
		}else{
      if (msg.guild.settings.get('welcomeMessage') !== false) {
        msg.guild.settings.set('welcomeMessage', false);
        description = oneLine`🎉 Les messages de bienvenue sont maintenant **désactivés** !`;
      }else{
        msg.guild.settings.set('welcomeMessage',true);
        description = oneLine`🎉 Les messages de bienvenue sont maintenant **activés** !`;
      }
    }
    defWelcomeEmbed
      .setColor(0xcd6e57)
      .setAuthor(msg.author.username, msg.author.displayAvatarURL())
      .setDescription(stripIndents`**Action:** ${description}`)
      .setTimestamp();

    return msg.embed(defWelcomeEmbed);
  }
};