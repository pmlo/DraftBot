const sqlite3 = require('sqlite3').verbose();
  path = require('path'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {oneLine, stripIndents} = require('common-tags')

module.exports = class WarnCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'warn',
      memberName: 'warn',
      group: 'moderation',
      aliases: ['warning','avertissement'],
      description: 'Warn un joueur',
      examples: ['warn DraftMan 1 Trop beau'],
      guildOnly: true,
      args: [
        {
          key: 'member',
          prompt: 'Quel membre voulez vous avertir ?',
          type: 'member'
        },
        {
          key: 'reason',
          prompt: 'Pour quelle raison souhaitez vous donner cet avertissement',
          type: 'string',
          default: ''
        }
      ],
      userPermissions: ['MANAGE_MESSAGES'] 
    });
  }

  async run (msg, {member, reason}) {

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
          return msg.embed(embed);
        })
    })
  }
};