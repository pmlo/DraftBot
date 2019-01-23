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
      args: [
        {
          key: 'argument',
          prompt: 'Que souhaitez vous faire ? `ajouter`,`add`/`enlever`,`retirer`,`remove`/`liste`,`liste`,`show`',
          type: 'string',
          default: '',
          oneOf: ['ajouter', 'add', 'enlever','retirer','remove','supprimer','list','show','liste'],
          parse: pf => pf.toLowerCase()
        },
        {
          key: 'mot',
          prompt: 'Sur quel mot souhaitez vous apporter des modifications ?',
          type: 'string',
          default: 'nonew',
          parse: mot => mot.toLowerCase()
        }
      ],
      clientPermissions: ['MANAGE_MESSAGES'],
      userPermissions: ['MANAGE_MESSAGES']
    });
  }

  async run (msg, {argument,mot}) {
    deleteCommandMessages(msg);
    let description;

    if(argument) {
      if(msg.guild.settings.get('badwords')){
        const badwords = msg.guild.settings.get('badwords');
        const oldWords = badwords.mots.split(',')

        if(['add','ajouter'].includes(argument)){
          if(oldWords.includes(mot)) return msg.reply('Ce mot est déjà interdit !')
          
          oldWords.push(mot);

          msg.guild.settings.set('badwords', {mots: oldWords.join(','), status: badwords.status});
          description = `🎉 La liste des mots interdit est maintenant: \`${oldWords.join('\`, \`')}\` !`;
  
          if(badwords.status !== true){
            description += `\nLe filtre des mots interdit est actuellement désactivé ! Pour le réactiver veuillez utilisez \`${msg.guild.commandPrefix}lexique\``
          }
        }

        if(['enlever','retirer','remove','supprimer'].includes(argument)){
          if(!oldWords.includes(mot)) return msg.reply('Ce mot n\'est pas dans la liste des mots interdits !')
          const newWords = oldWords.filter(w => w !== mot);
          
          msg.guild.settings.set('badwords', {mots: newWords.join(','), status: badwords.status});
          description = `🎉 La liste des mots interdit est maintenant: \`${newWords.join('\`, \`')}\` !`;
  
          if(badwords.status !== true){
            description += `\nLe filtre des mots interdit est actuellement désactivé ! Pour le réactiver veuillez utilisez \`${msg.guild.commandPrefix}lexique\``
          }
        }
        if(['list','show','liste'].includes(argument)){   

          description = `🎉 La liste des mots interdit est: \`${oldWords.join('\`, \`')}\` !`;
        }
      }else{
        msg.guild.settings.set('badwords', {mots: mot, status: true});
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