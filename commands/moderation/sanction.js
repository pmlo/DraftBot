const {Command} = require('discord.js-commando');
const {kickUser,banUser,warnUser,sendLogsBot,deleteCommandMessages} = require('../../utils.js')
const {MessageEmbed} = require('discord.js');

module.exports = class SanctionCommand extends Command {
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
      clientPermissions: ['KICK_MEMBERS','BAN_MEMBERS'],
      userPermissions: ['ADMINISTRATOR']
    });
  }

  async run (msg, {member}) {
    deleteCommandMessages(msg);

      const embed = new MessageEmbed()
      .setColor(0xcd6e57)
      .setAuthor(member.user.tag, member.user.displayAvatarURL())
      .setDescription(`Cet outil permet de sanctionner facilement un membre du serveur`)
      .addField('Icones:','<:kick:506129065619750922> Kick <:ban:506129039128395777> Ban ⚠ Warn')
      .setFooter(msg.guild.name,msg.guild.iconURL({format: 'png'}))
      .setTimestamp()

      getReactions(msg,embed).then(response => {
        const emoji = response.response;
        if(emoji.name === 'kick'){
          kickUser(msg,member,'')
          return sendLogsBot(msg, `Le membre ${member.user.tag} a été kick.`)
        }
        if(emoji.name === 'ban'){
          banUser(msg,member,'')
          return sendLogsBot(msg, `Le membre ${member.user.tag} a été ban.`)
        }
        if(emoji.name === '⚠'){
          warnUser(msg,member,'')
          return sendLogsBot(msg, `Le membre ${member.user.tag} a été ban.`)
        }
        if(emoji.name === '❌'){
          msg.client.emit('cancel')
          return msg.reply('l\'interface de sanction a été supprimé !')
        }
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