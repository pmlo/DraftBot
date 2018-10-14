const { MessageEmbed } = require('discord.js')
const { Command } = require('discord.js-commando')
const { stripIndents } = require('common-tags')
const { findChannel } = require('../../utils.js')

module.exports = class InviteCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'init',
      memberName: 'init',
      group: 'bot',
      aliases: ['initialisation', 'setup', 'install','config','configuration'],
      description: 'Configurer le bot pour le serveur',
      examples: ['configuration'],
      guildOnly: true,
      userPermissions: ['ADMINISTRATOR']
    });
  }

  run (msg) {
    const configEmbed = new MessageEmbed()
      .setTitle('Configuration')
      .setAuthor(msg.author.username,msg.author.displayAvatarURL({format: 'png'}))
      .setThumbnail(msg.client.user.displayAvatarURL({format: 'png'}))
      .setColor(0xcd6e57)
      .setDescription(
      stripIndents`
        Bienvenue sur mon procéssus de configuration !
        Je vais vous posez une série de question me permettant de répondre aux mieux à vos besoins.
        
        Vous pouvez arêter cette configuration à tout moment en envoyant \`cancel\`.
      `)
      .setFooter("Procéssus de configuration", msg.client.user.displayAvatarURL({format: 'png'}))
      .setTimestamp()

    msg.embed(configEmbed);
    msg.client.on('message', eventCancel);

    function eventCancel(message){
      if(msg.author.id !== message.author.id) return;

      if(message.content.toLowerCase() === 'cancel'){
        message.reply('configuration annulé !')
        msg.client.emit('cancel')
        msg.client.removeListener('message', eventCancel)
      }
    }
    this.runProcess(msg, 1);
  }

  runProcess (msg,process) {
    if(process === 1){
      return welcomeMessage(msg).then(response => {
        const value = response.response
        msg.guild.settings.set('welcomeMessage', value);
    
        msg.embed(resultEmbed(msg,`Les messages de bienvenue sont maintenant **${value === true ? 'activés' : 'désactivés'}** !`))
        this.runProcess(msg, value === true ? 2 : 3)
      }).catch(error => console.log(error))
    }
    if(process === 2){
      return channelWelcome(msg).then(response => {
        const value = response.response;
        msg.guild.settings.set('welcomeChannel', value);
    
        msg.embed(resultEmbed(msg,`Les messages de bienvenue seront maintenant envoyés dans le salon #${value.name} !`))
        this.runProcess(msg,3)
      }).catch(error => console.log(error))
    }

    // Il n'y pas plus de process
    msg.embed(questionEmbed(msg,'Félicitation la configuration est terminé, merci !'))
    msg.client.emit('cancel')
  }
};

/* 
* Etapes de la commande 
*
* Différents étapes de pour avoir les réponses de l'utilisateur
*/

const welcomeMessage = (msg) => new Promise((resolve, reject) => {
  const emojis = ['✅','❎']

  msg.say({
    embed: questionEmbed(msg,'Voulez vous un message de bienvenue quand un joueur rejoinds le serveur ? *exemple ci dessous*'),
    file: 'https://www.draftman.fr/images/draftbot/exemple_welcome_message.jpg'
  }).then(question=>{
    question.react(emojis[0]);
    question.react(emojis[1]);

    function eventListenReactions(messageReaction,user){
        if(user.bot) return;
        if(messageReaction.message.id !== question.id) return;
        if(!emojis.includes(messageReaction.emoji.name)){
          messageReaction.users.remove(user)
          return;
        }
        msg.client.removeListener('messageReactionAdd', arguments.callee);
        messageReaction.message.delete();
    
        return resolve({ response: messageReaction.emoji.name === '✅' ? true : false });
    }
  
    msg.client.on('messageReactionAdd',eventListenReactions)
  
    msg.client.once('cancel', () => {
      msg.client.removeListener('message', eventListenReactions)
      return reject('cancelled')
    })
  })
});

const channelWelcome = (msg) => new Promise((resolve, reject) => {
  msg.embed(questionEmbed(msg,'Dans quel salon voulez vous les messages de bienvenue ?'));

  function eventListenChannel(message) {
    const func = arguments.callee
    if(msg.author.id !== message.author.id) return;
    findChannel(message.content, msg).then(response => {
      const channel = response.channel;
      if(channel === null) {
        message.delete({timeout: 2000})
        msg.embed(errorEmbed(msg,`Impossible de trouver le salon \`${message}\`, merci de réessayer!`)).then(m => m.delete({timeout: 3000}))
        return;
      }
      msg.client.removeListener('message', func);
      return resolve({ response: channel });
    })
  }

  msg.client.on('message',eventListenChannel);

  msg.client.once('cancel', () => {
    msg.client.removeListener('message', eventListenChannel)
    return reject('cancelled')
  })
});

/* 
* Embeds 
*
* Embeds pour créer les réponses plus facilement
*/

const questionEmbed = (msg, question) => {
  return new MessageEmbed()
  .setAuthor(msg.author.username,msg.author.displayAvatarURL({format: 'png'}))
  .setColor(0x39d600)
  .setDescription(question)
  .setFooter("Procéssus de configuration", msg.client.user.displayAvatarURL({format: 'png'}))
  .setTimestamp();
}

const errorEmbed = (msg, message) => {
  return new MessageEmbed()
  .setAuthor(msg.author.username,msg.author.displayAvatarURL({format: 'png'}))
  .setColor(0xce0000)
  .setDescription(message)
  .setFooter("Procéssus de configuration", msg.client.user.displayAvatarURL({format: 'png'}))
  .setTimestamp();
}

const resultEmbed = (msg, conclusion) => {
  return new MessageEmbed()
  .setAuthor(msg.author.username,msg.author.displayAvatarURL({format: 'png'}))
  .setColor(0xcd6e57)
  .setDescription(conclusion)
  .setFooter("Procéssus de configuration", msg.client.user.displayAvatarURL({format: 'png'}))
  .setTimestamp();
}