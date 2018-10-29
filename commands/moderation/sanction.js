const {Command} = require('discord.js-commando');
const {sendLogs,error} = require('../../utils.js')
const sqlite3 = require('sqlite3').verbose();

module.exports = class BanCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'sanction',
      memberName: 'sanction',
      group: 'moderation',
      aliases: ['ss'],
      description: 'Permet de lancer une sanction en vers un membre',
      examples: ['ss DraftMan'],
      guildOnly: true,
      args: [{
        key: 'member',
        prompt: 'Quel membre voulez vous sanctionner',
        type: 'member'
      }],
      clientPermissions: ['ADMINISTRATOR'],
      userPermissions: ['ADMINISTRATOR']
    });
  }

  async run (msg, {member}) {
    msg.delete()

    const db = new sqlite3.Database(path.join(__dirname, '../../databases/warnings.sqlite'))

    let warns;

    db.each(`SELECT count('user') AS 'count' FROM "${msg.guild.id}" WHERE user = ?`,[member.id],(err, {count}) => {
        warns = !err ? count : 'Aucuns' ;

        const embed = new MessageEmbed()
        .setColor(0xcd6e57)
        .setAuthor(member.user.tag, member.user.displayAvatarURL())
        .setDescription(`Cet outil permet de sanctionner facilement les membres du serveur`)
        .addField('Avertissements',warns,true)
        .addField('Date d\'arrivé',member.joinedTimestamp,true)
        .setFooter(msg.guild.name,msg.guild.iconURL({format: 'png'}))
        .setTimestamp()

        getReactions(msg,embed).then(response => {
          const emoji = response.response;
          if(emoji.name === 'kick'){
            if(!member.kickable) return msg.channel.send(error('Impossible de kick ce membre !'))
            member.kick()
            return sendLogs(msg, `Le membre ${member.user.tag} a été kick.`)
          }
          if(emoji.name === 'ban'){
            if(!member.bannable) return msg.channel.send(error('Impossible de bannir ce membre !'))
            member.ban()
            return sendLogs(msg, `Le membre ${member.user.tag} a été ban.`)
          }
          if(emoji.name === '⚠'){
            const db = new sqlite3.Database(path.join(__dirname, '../../databases/warnings.sqlite'))
    
            db.serialize(() => {
              db.run(`CREATE TABLE IF NOT EXISTS "${msg.guild.id}"(user TEXT, reason TEXT NOT NULL, date DATE, mod TEXT)`)
              .run(`INSERT INTO "${msg.guild.id}"(user, reason, date, mod) VALUES (?, ?, ?, ?)`,[
                member.id,
                reason !== '' ? reason : 'Aucune raison n\'a été spécifié par le modérateur',
                new Date(),
                msg.member.id
              ])
              .each(`SELECT count('user') AS 'count' FROM "${msg.guild.id}" WHERE user = ?`,[member.id],(err, {count}) => {
                const embed = new MessageEmbed()
                .setColor(0xcd6e57)
                .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
                .setDescription(stripIndents`
                  **Membre:** ${member.user.tag}
                  **Action:** Avertissement
                  **Avertissements:** \`${count-1}\` => \`${count}\`
                  **Raison:** ${reason !== '' ? reason : 'Aucune raison n\'a été spécifié par le modérateur'}`)
                .setTimestamp();
                return msg.channel.send(member.user.tag,embed);
              })
            })
            return sendLogs(msg, `Le membre ${member.user.tag} a été ban.`)
          }
          if(emoji.name === '❌'){
            msg.client.emit('cancel')
            return message.reply('l\'interface de sanction a été supprimé !')
          }
        })
    })
  }
};

const getReactions = (msg,embed) => new Promise((resolve, reject) => {
  const emojis = ['506129065619750922','506129039128395777','⚠','❌']

  msg.embed(embed)
  .then(question => {
    emojis.reduce((acc, emoji) => acc.then(() => question.react(emoji)),Promise.resolve())

    function eventListenReactions(messageReaction,user){
        if(user.bot || messageReaction.message.id !== question.id || user.id !== msg.author.id) return;
        if(!emojis.includes(messageReaction.emoji.id) && !emojis.includes(messageReaction.emoji.name)){
          messageReaction.users.remove(user)
          return;
        }
        msg.client.removeListener('messageReactionAdd', arguments.callee);
        messageReaction.message.delete();
    
        return resolve({ response: messageReaction.emoji});
    }
  
    msg.client.on('messageReactionAdd',eventListenReactions)
  
    msg.client.once('cancel', () => {
      msg.client.removeListener('message', eventListenReactions)
      return reject('cancelled')
    })
  })
});