const {Command} = require('discord.js-commando');
const {sendLogsBot,deleteCommandMessages} = require('../../utils.js');

module.exports = class LexiqueCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'lexique',
      memberName: 'lexique',
      group: 'configuration',
      aliases: ['lexique-admin','admin-lexique'],
      description: 'Interdire un certains vocabulaire au serveur.',
      examples: ['lexique add fuck','lexique list'],
      guildOnly: true,
      args: [{
				key: 'mots',
				prompt: 'Quels sont les mots que vous souhaitez interdir?',
        type: 'string',
        default: 'nonew',
        validate: val => {
          if (/([\S ]*,[\S ]*)*/i.test(val) && val.split(',').length >= 1) {
              return true;
          }

          return 'Vous devez suivre le format suivant `mot 1,mot 2,mot 3`, *par exemple* `fdp,fuck`';
        },
        parse: mots => mots.split(',')
			}],
      clientPermissions: ['MANAGE_MESSAGES'],
      userPermissions: ['MANAGE_MESSAGES']
    });
  }

  async run (msg, {mots}) {
    deleteCommandMessages(msg);
    let description;

    if(mots !== 'nonew') {
      if(msg.guild.settings.get('badwords')){
        const badwords = msg.guild.settings.get('badwords');
        const newWords = badwords.mots.concat(mots);
        
        msg.guild.settings.set('badwords', {mots: newWords.join(','), status: badwords.status});
        description = `🎉 Vous venez d'ajouter les mots suivants aux lexique des mots interdits: \`${mots.join('\`, \`')}\` !`;

        if(badwords.status !== true){
          description += `\nLe filtre des mots interdit est actuellement désactivé ! Pour le réactiver veuillez utilisez \`${msg.guild.commandPrefix}lexique\``
        }
      }else{
        msg.guild.settings.set('badwords', {mots: mots.join(','), status: true});
        description = `🎉 Le lexique des mots interdit viens d'être **activé**, vous y avez ajouté les mots suivants: \`${mots.join('\`, \`')}\` !`;
      }
    }else{
      if(msg.guild.settings.get('badwords') && msg.guild.settings.get('badwords').status == true) {
        msg.guild.settings.set('badwords', {mots: msg.guild.settings.get('badwords') ? msg.guild.settings.get('badwords').mots : '', status: false});
        description = `🎉 Les messages de bienvenue sont maintenant **désactivés** !`;
      }else{
        msg.guild.settings.set('badwords', {mots: msg.guild.settings.get('badwords') ? msg.guild.settings.get('badwords').mots : '', status: true});
        description = `🎉 Les messages de bienvenue sont maintenant **activés** !`;
      }
    }

    return sendLogsBot(msg, description)
  }
};