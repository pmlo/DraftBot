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
      .setFooter("Processus de configuration", msg.client.user.displayAvatarURL({format: 'png'}))
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
    if(process === 3){
      return logsMessages(msg).then(response => {
        const value = response.response
        msg.guild.settings.set('logsMessage',value);
    
        msg.embed(resultEmbed(msg,`Les messages de logs sont maintenant **${value === true ? 'activés' : 'désactivés'}** !`))
        this.runProcess(msg, value === true ? 4 : 5)
      }).catch(error => console.log(error))
    }
    if(process === 4){
      return channelLogs(msg).then(response => {
        const value = response.response;
        msg.guild.settings.set('logsChannel', value);
    
        msg.embed(resultEmbed(msg,`Les messages de logs seront maintenant envoyés dans le salon #${value.name} !`))
        this.runProcess(msg,5)
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

    function eventListenWelcomeMessageReactions(messageReaction,user){
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
  
    msg.client.on('messageReactionAdd',eventListenWelcomeMessageReactions)
  
    msg.client.once('cancel', () => {
      msg.client.removeListener('message', eventListenWelcomeMessageReactions)
      return reject('cancelled')
    })
  })
});

const channelWelcome = (msg) => new Promise((resolve, reject) => {
  msg.embed(questionEmbed(msg,'Dans quel salon voulez vous les messages de bienvenue ?'));

  function eventListenChannelWelcomeChannel(message) {
    const func = arguments.callee
    if(msg.author.id !== message.author.id) return;
    findChannel(message.content, msg).then(response => {
      const channel = response.channel;
      msg.client.removeListener('message', func);
      return resolve({ response: channel });
    }).catch(error => {
      message.delete({timeout: 2000})
      msg.embed(errorEmbed(msg,`Impossible de trouver le salon \`${message}\`, merci de réessayer!`)).then(m => m.delete({timeout: 3000}))
      console.log(error)
      return;
    })
  }

  msg.client.on('message',eventListenChannelWelcomeChannel);

  msg.client.once('cancel', () => {
    msg.client.removeListener('message', eventListenChannelWelcomeChannel)
    return reject('cancelled')
  })
});

const logsMessages = (msg) => new Promise((resolve, reject) => {
  const emojis = ['✅','❎']

  msg.say({
    embed: questionEmbed(msg,'Voulez vous afficher les logs du serveur dans un salon ? *exemple ci dessous*'),
    file: 'https://www.draftman.fr/images/draftbot/exemple_logs_message.jpg'
  }).then(question=>{
    question.react(emojis[0]);
    question.react(emojis[1]);

    function eventListenLogsMessagesReactions(messageReaction,user){
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
  
    msg.client.on('messageReactionAdd',eventListenLogsMessagesReactions)
  
    msg.client.once('cancel', () => {
      msg.client.removeListener('message', eventListenLogsMessagesReactions)
      return reject('cancelled')
    })
  })
});

const channelLogs = (msg) => new Promise((resolve, reject) => {
  msg.embed(questionEmbed(msg,'Dans quel salon voulez vous les messages de logs ?'));

  function eventListenChannelLogsChannel(message) {
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

  msg.client.on('message',eventListenChannelLogsChannel);

  msg.client.once('cancel', () => {
    msg.client.removeListener('message', eventListenChannelLogsChannel)
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
  .setFooter("Processus de configuration", msg.client.user.displayAvatarURL({format: 'png'}))
  .setTimestamp();
}

const errorEmbed = (msg, message) => {
  return new MessageEmbed()
  .setAuthor(msg.author.username,msg.author.displayAvatarURL({format: 'png'}))
  .setColor(0xce0000)
  .setDescription(message)
  .setFooter("Processus de configuration", msg.client.user.displayAvatarURL({format: 'png'}))
  .setTimestamp();
}

const resultEmbed = (msg, conclusion) => {
  return new MessageEmbed()
  .setAuthor(msg.author.username,msg.author.displayAvatarURL({format: 'png'}))
  .setColor(0xcd6e57)
  .setDescription(conclusion)
  .setFooter("Processus de configuration", msg.client.user.displayAvatarURL({format: 'png'}))
  .setTimestamp();
}