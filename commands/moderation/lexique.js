const {Command} = require('discord.js-commando');
const {sendLogsBot,deleteCommandMessages} = require('../../utils.js');

module.exports = class LexiqueCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'lexique',
      memberName: 'lexique',
      group: 'moderation',
      aliases: ['lexique-admin','admin-lexique'],
      description: 'Interdire un certains vocabulaire au serveur.',
      examples: ['lexique add fuck','lexique list'],
      guildOnly: true,
      args: [{
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
      }],
      clientPermissions: ['MANAGE_MESSAGES'],
      userPermissions: ['MANAGE_MESSAGES']
    });
  }

  async run (msg, {argument,mot}) {
    deleteCommandMessages(msg);
    let description;

    if(argument) {
      if(msg.guild.settings.get('lexique')){
        const badwords = msg.guild.settings.get('lexique');
        const oldWords = badwords.mots !== '' ? badwords.mots.split(',') : []

        if(['add','ajouter'].includes(argument)){
          if(oldWords.includes(mot)) return msg.reply('Ce mot est déjà interdit !')
          
          oldWords.push(mot);

          msg.guild.settings.set('lexique', {mots: oldWords.length > 1 ? oldWords.join(',') : oldWords[0], status: badwords.status});
          description = `🎉 La liste des mots interdit est maintenant: \`${oldWords.join('\`, \`')}\` !`;
  
          if(badwords.status !== true){
            description += `\nLe filtre des mots interdit est actuellement désactivé ! Pour le réactiver veuillez utilisez \`${msg.guild.commandPrefix}lexique\``
          }
        }

        if(['enlever','retirer','remove','supprimer'].includes(argument)){
          if(!oldWords.includes(mot)) return msg.reply('Ce mot n\'est pas dans la liste des mots interdits !')
          const newWords = oldWords.filter(w => w !== mot);

          msg.guild.settings.set('lexique', {mots: newWords.length > 0 ? newWords.join(',') : '', status: badwords.status});
          description = `🎉 La liste des mots interdit est maintenant: \`${newWords.join('\`, \`')}\` !`;
  
          if(badwords.status !== true){
            description += `\nLe filtre des mots interdit est actuellement désactivé ! Pour le réactiver veuillez utilisez \`${msg.guild.commandPrefix}lexique\``
          }
        }
        if(['list','show','liste'].includes(argument)){   
          if(oldWords.length === 0) {
            description = `La liste des mots interdit est vide, vous pouvez en ajouter en faisant \`${msg.guild.commandPrefix}lexique add <votre mot>\` !`; 
          }else{
            description = `🎉 La liste des mots interdit est: \`${oldWords.join('\`, \`')}\` !`;
          }
        }
      }else{
        if(['add','ajouter'].includes(argument)){
          msg.guild.settings.set('lexique', {mots: mot, status: true});
          description = `🎉 La liste des mots interdit est maintenant: \`${oldWords.join('\`, \`')}\` !`;
        }
        if(['enlever','retirer','remove','supprimer'].includes(argument)){
          msg.guild.settings.set('lexique', {mots: '', status: true});
          return msg.reply('Ce mot n\'est pas dans la liste des mots interdits !')
        }
        if(['list','show','liste'].includes(argument)){
          msg.guild.settings.set('lexique', {mots: '', status: true});
          description = `🎉 La liste des mots interdit est vide, vous pouvez en ajouter en faisant \`${msg.guild.commandPrefix}lexique add <votre mot>\` !`;
        }
        description = `🎉 Le lexique des mots interdit viens d'être **activé**, vous y avez ajouté les mots suivants: \`${mots.join('\`, \`')}\` !`;
      }
    }else{
      if(msg.guild.settings.get('lexique') && msg.guild.settings.get('lexique').status == true) {
        msg.guild.settings.set('lexique', {mots: msg.guild.settings.get('lexique') ? msg.guild.settings.get('lexique').mots : '', status: false});
        description = `🎉 La restriction du vocablulaire est maintenant **désactivé** !`;
      }else{
        msg.guild.settings.set('lexique', {mots: msg.guild.settings.get('lexique') ? msg.guild.settings.get('lexique').mots : '', status: true});
        description = `🎉 La restriction du vocablulaire est maintenant **activé** !`;
      }
    }

    return sendLogsBot(msg, description)
  }
};