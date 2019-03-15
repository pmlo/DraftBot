const {Command} = require('discord.js-commando')
const Database = require('better-sqlite3');
const path = require('path');
const {deleteCommandMessages,parseShortTime,deleteM,sendLogsBot} = require('../../utils.js')
const moment = require('moment');
moment().locale('fr');

module.exports = class InitCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'repeat-message',
      memberName: 'repeat-message',
      group: 'utilitaires',
      aliases: ['message-repeat','repeatmessage','messagerepeat','rmessage'],
      description: 'Créer un message récurrent',
      examples: ['repeat-message 30 C\'est mon message'],
      guildOnly: true,
      args: [{
          key: 'temps',
          prompt: 'Combien de temps doit s\'écouler entre chaque message ?\nExemple : `30m` pour 30 minutes ; `3h` pour 3 heures ; `3j` ou `3d` pour 3 jours',
          type: 'string'
        },
        {
          key: 'message',
          prompt: 'Quel est le message récurrent ?',
          type: 'string'
        }
      ],
      userPermissions: ['MANAGE_MESSAGES']
    });
  }

  //{guild,content,channel,time,fois }

  async run(msg, {temps,message}) {
    const db = new Database(path.join(__dirname, '../../storage.sqlite'));
    deleteCommandMessages(msg);

    msg.reply('Le système est désactivé pour l\'instant !')

    await parseShortTime(temps).then(response => {
      temps = response.response
    }).catch(error => {
      console.log('AutoMessage command => parseShortTime func', error)
      return msg.reply(`La valeur \`${temps}\` est invalide, merci de réessayer!`)
    })

    message = {
      content: message,
      options: {
        files: msg.attachments.map(a => a.proxyURL)
      }
    }

    db.prepare(`INSERT INTO "messages"(guild, channel, user, content, time, date) VALUES ($guild, $channel, $user, $content, $time, $date)`).run({
      guild: msg.guild.id,
      channel: msg.channel.id,
      user: msg.author.id,
      content: JSON.stringify(message),
      time: temps,
      date: `${new Date()}`
    })

    sendLogsBot(msg, `Le message automatique a bien été enregistré et débutera dans ${temps} minutes ! *voici ci dessous le message qui sera envoyé*`)
    
    return msg.say(message.content, message.options);
  }
}