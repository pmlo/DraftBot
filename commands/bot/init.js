const { MessageEmbed } = require('discord.js')
const { Command } = require('discord.js-commando')
const { stripIndents } = require('common-tags')
const { findChannel,findRole } = require('../../utils.js')

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
    
    this.timer = 0;
    this.logschannel = false;
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
        
        Vous pouvez arêter cette configuration à tout moment en envoyant \`cancel\` ou en dépassant 30 secondes par question.
      `)
      .setFooter("Processus de configuration", msg.client.user.displayAvatarURL({format: 'png'}))
      .setTimestamp()

    msg.embed(configEmbed);
    msg.client.on('message', eventCancel);

    function eventCancel(message){
      if(msg.author.id !== message.author.id) return;

      if(message.content.toLowerCase() === 'cancel'){
        message.reply('configuration annulé !')
        stopTimer()
        msg.client.emit('cancel')
        msg.client.removeListener('message', eventCancel)
      }

      msg.client.once('cancelCancel', () => {
        msg.client.removeListener('message', eventCancel)
        
      })
    }
    this.runProcess(msg, 1);
  }

  runProcess (msg,process) {
    startNewTimer(msg)
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
    
        msg.embed(resultEmbed(msg,`Les messages de bienvenue seront maintenant envoyés dans le salon \`#${value.name}\` !`))
        this.runProcess(msg,3)
      }).catch(error => console.log(error))
    }
    if(process === 3){
      return roleAutoAsk(msg).then(response => {
        const value = response.response
        //aucun stockage 
        msg.embed(resultEmbed(msg,`La fonction de role automatique est maintenant **${value === true ? 'activé' : 'désactivé'}** !`))
        this.runProcess(msg, value === true ? 4 : 5)
      }).catch(error => console.log(error))
    }
    if(process === 4){
      return roleAuto(msg).then(response => {
        const value = response.response;
        msg.guild.settings.set('defaultRole', value.id);
    
        msg.embed(resultEmbed(msg,`Le role \`${value.name}\` sera maintenant ajouté automatiquement aux nouveaux membres !`))
        this.runProcess(msg,5);
      }).catch(error => console.log(error))
    }
    if(process === 5){
      return logsMessagesBot(msg).then(response => {
        const value = response.response;
        msg.guild.settings.set('logsMessageBot',value);
    
        msg.embed(resultEmbed(msg,`Les messages de logs du bot sont maintenant **${value === true ? 'activés' : 'désactivés'}** !`))
        this.logschannel = value;
        this.runProcess(msg, 6);
      }).catch(error => console.log(error))
    }
    if(process === 6){
      return logsMessagesServ(msg).then(response => {
        const value = response.response
        msg.guild.settings.set('logsMessageServ',value);
    
        msg.embed(resultEmbed(msg,`Les messages de logs du serveur sont maintenant **${value === true ? 'activés' : 'désactivés'}** !`))
        this.runProcess(msg, value === true || this.logschannel === true ? 7 : 8)
      }).catch(error => console.log(error))
    }
    if(process === 7){
      return channelLogs(msg).then(response => {
        const value = response.response;
        msg.guild.settings.set('logsChannel', value);
    
        msg.embed(resultEmbed(msg,`Les messages de logs seront maintenant envoyés dans le salon \`#${value.name}\` !`))
        this.runProcess(msg,8)
      }).catch(error => console.log(error))
    }
    if(process === 8){
      return levelSystem(msg).then(response => {
        const value = response.response;
        msg.guild.settings.set('levelSystem', value);
    
        msg.embed(resultEmbed(msg,`Le système de niveau est maintenant **${value === true ? 'activé' : 'désactivé'}** !`))
        this.runProcess(msg,9)
      }).catch(error => console.log(error))
    }
    if(process === 9){
      return authorizeInvites(msg).then(response => {
        const value = response.response;
        msg.guild.settings.set('invites', value);
    
        msg.embed(resultEmbed(msg,`Les invitations seront maintenant **${value === true ? 'autorisés' : 'interdites donc supprimés'}** !`))
        this.runProcess(msg,10)
      }).catch(error => console.log(error))
    }

    // Il n'y pas plus de process
    msg.embed(questionEmbed(msg,'Félicitations, la configuration est terminée, merci !'))
    stopTimer()
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

  msg.embed(questionEmbedFile(msg,'Voulez vous un message de bienvenue quand un joueur rejoint le serveur ? *exemple ci-dessous*','https://www.draftman.fr/images/draftbot/exemples/welcome_message.png'))
  .then(question=>{
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
  msg.embed(questionEmbed(msg,'Dans quel salon voulez vous les messages de bienvenue ?'))
  .then(question => {
    function eventListenChannelWelcomeChannel(message) {
      const func = arguments.callee
      if(msg.author.id !== message.author.id) return;
      findChannel(message.content, msg).then(response => {
        const channel = response.channel;
        msg.client.removeListener('message', func);
        message.delete()
        question.delete()
        return resolve({ response: channel });
      }).catch(error => {
        message.delete()
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
  })  
});

const roleAutoAsk = (msg) => new Promise((resolve, reject) => {
  const emojis = ['✅','❎']

  msg.embed(questionEmbed(msg,'Voulez vous un role à ajouter automatiquement aux nouveaux membres ?'))
  .then(question => {
    question.react(emojis[0]);
    question.react(emojis[1]);

    function eventListenRoleAutoAskReactions(messageReaction,user){
        if(user.bot || messageReaction.message.id !== question.id || user.id !== msg.author.id) return;
        if(!emojis.includes(messageReaction.emoji.name)){
          messageReaction.users.remove(user)
          return;
        }
        msg.client.removeListener('messageReactionAdd', arguments.callee);
        messageReaction.message.delete();
    
        return resolve({ response: messageReaction.emoji.name === '✅' ? true : false });
    }
  
    msg.client.on('messageReactionAdd',eventListenRoleAutoAskReactions)
  
    msg.client.once('cancel', () => {
      msg.client.removeListener('message', eventListenRoleAutoAskReactions)
      return reject('cancelled')
    })
  })
});

const roleAuto = (msg) => new Promise((resolve, reject) => {
  msg.embed(questionEmbed(msg,'Quel est le role que vous souhaitez ajouter automatiquement aux nouveaux membres ?'))
  .then(question => {
    function eventListenRoleAutoRole(message) {
      const func = arguments.callee
      if(msg.author.id !== message.author.id) return;
      findRole(message.content, msg).then(response => {
        const role = response.role;
        msg.client.removeListener('message', func);
        message.delete()
        question.delete()
        return resolve({ response: role });
      }).catch(error => {
        message.delete({timeout: 2000})
        msg.embed(errorEmbed(msg,`Impossible de trouver le role \`${message}\`, merci de réessayer!`)).then(m => m.delete({timeout: 3000}))
        console.log(error)
        return;
      })
    }
  
    msg.client.on('message',eventListenRoleAutoRole);
  
    msg.client.once('cancel', () => {
      msg.client.removeListener('message', eventListenRoleAutoRole)
      return reject('cancelled')
    })
  })
});

const logsMessagesBot = (msg) => new Promise((resolve, reject) => {
  const emojis = ['✅','❎']

  msg.embed(questionEmbedFile(msg,'Voulez vous afficher les logs du **bot** dans un salon de logs ? *exemple ci-dessous*','https://www.draftman.fr/images/draftimagesbot/exemples/logsbot_message.png'))
  .then(question=>{
    question.react(emojis[0]);
    question.react(emojis[1]);

    function eventListenLogsMessagesBotReactions(messageReaction,user){
        if(user.bot || messageReaction.message.id !== question.id || user.id !== msg.author.id) return;
        if(!emojis.includes(messageReaction.emoji.name)){
          messageReaction.users.remove(user)
          return;
        }
        msg.client.removeListener('messageReactionAdd', arguments.callee);
        messageReaction.message.delete();
    
        return resolve({ response: messageReaction.emoji.name === '✅' ? true : false });
    }
  
    msg.client.on('messageReactionAdd',eventListenLogsMessagesBotReactions)
  
    msg.client.once('cancel', () => {
      msg.client.removeListener('message', eventListenLogsMessagesBotReactions)
      return reject('cancelled')
    })
  })
});

const logsMessagesServ = (msg) => new Promise((resolve, reject) => {
  const emojis = ['✅','❎']

  msg.embed(questionEmbedFile(msg,'Voulez vous afficher les logs du **serveur** dans un salon de logs ? *exemple ci-dessous*','https://www.draftman.fr/images/draftbot/exemples/logsserv_message.png'))
  .then(question=>{
    question.react(emojis[0]);
    question.react(emojis[1]);

    function eventListenLogsMessagesServReactions(messageReaction,user){
        if(user.bot || messageReaction.message.id !== question.id || user.id !== msg.author.id) return;
        if(!emojis.includes(messageReaction.emoji.name)){
          messageReaction.users.remove(user)
          return;
        }
        msg.client.removeListener('messageReactionAdd', arguments.callee);
        messageReaction.message.delete();
    
        return resolve({ response: messageReaction.emoji.name === '✅' ? true : false });
    }
  
    msg.client.on('messageReactionAdd',eventListenLogsMessagesServReactions)
  
    msg.client.once('cancel', () => {
      msg.client.removeListener('message', eventListenLogsMessagesServReactions)
      return reject('cancelled')
    })
  })
});

const channelLogs = (msg) => new Promise((resolve, reject) => {
  msg.embed(questionEmbed(msg,'Dans quel salon voulez vous les messages de logs ?'))
  .then(question => {
    function eventListenChannelLogsChannel(message) {
      const func = arguments.callee
      if(msg.author.id !== message.author.id) return;
      findChannel(message.content, msg).then(response => {
        const channel = response.channel;
        if(channel === null) {
          message.delete()
          msg.embed(errorEmbed(msg,`Impossible de trouver le salon \`${message}\`, merci de réessayer!`)).then(m => m.delete({timeout: 3000}))
          return;
        }
        message.delete()
        question.delete()
        msg.client.removeListener('message', func);
        return resolve({ response: channel });
      })
    }
  
    msg.client.on('message',eventListenChannelLogsChannel);
  
    msg.client.once('cancel', () => {
      msg.client.removeListener('message', eventListenChannelLogsChannel)
      return reject('cancelled')
    })
  })
});

const authorizeInvites = (msg) => new Promise((resolve, reject) => {
  const emojis = ['✅','❎']

  msg.embed(questionEmbed(msg,'Autorisez vous que des gens envoient des invitations vers d\'autres serveurs ?'))
  .then(question => {
    question.react(emojis[0]);
    question.react(emojis[1]);

    function eventListenInvitesReactions(messageReaction,user){
        if(user.bot || messageReaction.message.id !== question.id || user.id !== msg.author.id) return;
        if(!emojis.includes(messageReaction.emoji.name)){
          messageReaction.users.remove(user)
          return;
        }
        msg.client.removeListener('messageReactionAdd', arguments.callee);
        messageReaction.message.delete();
    
        return resolve({ response: messageReaction.emoji.name === '✅' ? true : false });
    }
  
    msg.client.on('messageReactionAdd',eventListenInvitesReactions)
  
    msg.client.once('cancel', () => {
      msg.client.removeListener('message', eventListenInvitesReactions)
      return reject('cancelled')
    })
  })
});

const levelSystem = (msg) => new Promise((resolve, reject) => {
  const emojis = ['✅','❎']

  msg.embed(questionEmbedFile(msg,'Souhaitez vous activer la fonction de niveau ? *exemple ci-dessous*','https://www.draftman.fr/images/draftbot/exemples/rank_message.png'))
  .then(question => {
    question.react(emojis[0]);
    question.react(emojis[1]);

    function eventListenLevelSystemReactions(messageReaction,user){
      if(user.bot || messageReaction.message.id !== question.id || user.id !== msg.author.id) return;
        if(!emojis.includes(messageReaction.emoji.name)){
          messageReaction.users.remove(user)
          return;
        }
        msg.client.removeListener('messageReactionAdd', arguments.callee);
        messageReaction.message.delete();
    
        return resolve({ response: messageReaction.emoji.name === '✅' ? true : false });
    }
  
    msg.client.on('messageReactionAdd',eventListenLevelSystemReactions)
  
    msg.client.once('cancel', () => {
      msg.client.removeListener('message', eventListenLevelSystemReactions)
      return reject('cancelled')
    })
  })
});

const startNewTimer = (msg) => {
  stopTimer()
  this.timer = setTimeout(() => {
    msg.reply('les 30 secondes sont écoulés !')
    msg.client.emit('cancelCancel');
    msg.client.emit('cancel');
  },30000);
}


const stopTimer = () => clearTimeout(this.timer);



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
  .setTimestamp()
}

const questionEmbedFile = (msg, question,file) => {
  return new MessageEmbed()
  .setAuthor(msg.author.username,msg.author.displayAvatarURL({format: 'png'}))
  .setColor(0x39d600)
  .setDescription(question)
  .setFooter("Processus de configuration", msg.client.user.displayAvatarURL({format: 'png'}))
  .setTimestamp()
  .setImage(file)
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