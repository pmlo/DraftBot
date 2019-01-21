const { MessageEmbed } = require('discord.js')
const { Command } = require('discord.js-commando')
const { stripIndents } = require('common-tags')
const { findChannel,findRole,deleteCommandMessages} = require('../../utils.js')

module.exports = class InitCommand extends Command {
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
    deleteCommandMessages(msg);
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
      }).catch(error => console.log('Init command => welcomeMessage',error))
    }
    if(process === 2){
      return channelWelcome(msg).then(response => {
        const value = response.response;
        msg.guild.settings.set('welcomeChannel', value);
    
        msg.embed(resultEmbed(msg,`Les messages de bienvenue seront maintenant envoyés dans le salon \`#${value.name}\` !`))
        this.runProcess(msg,3)
      }).catch(error => console.log('Init command => welcomeChannel',error))
    }
    if(process === 3){
      return roleAutoAsk(msg).then(response => {
        const value = response.response
        if(value !== true ) msg.guild.settings.remove('defaultRole');
        msg.embed(resultEmbed(msg,`La fonction de role automatique est maintenant **${value === true ? 'activé' : 'désactivé'}** !`))
        this.runProcess(msg, value === true ? 4 : 5)
      }).catch(error => console.log('Init command => roleAutoAsk',error))
    }
    if(process === 4){
      return roleAuto(msg).then(response => {
        const value = response.response;
        msg.guild.settings.set('defaultRole', value.id);
    
        msg.embed(resultEmbed(msg,`Le role \`${value.name}\` sera maintenant ajouté automatiquement aux nouveaux membres !`))
        this.runProcess(msg,5);
      }).catch(error => console.log('Init command => roleAuto',error))
    }
    if(process === 5){
      return logsMessagesBot(msg).then(response => {
        const value = response.response;
        msg.guild.settings.set('logsMessageBot',value);
    
        msg.embed(resultEmbed(msg,`Les messages de logs du bot sont maintenant **${value === true ? 'activés' : 'désactivés'}** !`))
        this.logschannel = value;
        this.runProcess(msg, 6);
      }).catch(error => console.log('Init command => logsMessageBot',error))
    }
    if(process === 6){
      return logsMessagesServ(msg).then(response => {
        const value = response.response
        msg.guild.settings.set('logsMessageServ',value);
    
        msg.embed(resultEmbed(msg,`Les messages de logs du serveur sont maintenant **${value === true ? 'activés' : 'désactivés'}** !`))
        this.runProcess(msg, value === true || this.logschannel === true ? 7 : 8)
      }).catch(error => console.log('Init command => logsMessageServ',error))
    }
    if(process === 7){
      return channelLogs(msg).then(response => {
        const value = response.response;
        msg.guild.settings.set('logsChannel', value);
    
        msg.embed(resultEmbed(msg,`Les messages de logs seront maintenant envoyés dans le salon \`#${value.name}\` !`))
        this.runProcess(msg,8)
      }).catch(error => console.log('Init command => channelLogs',error))
    }
    if(process === 8){
      return levelSystem(msg).then(response => {
        const value = response.response;
        msg.guild.settings.set('levelSystem', value);
    
        msg.embed(resultEmbed(msg,`Le système de niveau est maintenant **${value === true ? 'activé' : 'désactivé'}** !`))
        this.runProcess(msg,value === true ? 9 : 10)
      }).catch(error => console.log('Init command => levelSystem',error))
    }
    if(process === 9){
      return levelSystemXp(msg).then(response => {
        const value = response.response;
        msg.guild.settings.set('xpCount', value);
        const sValue = value.split(':')
        
        msg.embed(resultEmbed(msg,`L'xp attribué aux membres lors de l'envoie d'un message sera ${ value === '0' ? `de \`0\`xp` : `entre  \`${sValue[0]}\` et \`${sValue[1]}\`xp`} !`));
  
        this.runProcess(msg,10)
      }).catch(error => console.log('Init command => levelSystemXp',error))
    }
    if(process === 10){
      return authorizeInvites(msg).then(response => {
        const value = response.response;
        msg.guild.settings.set('invites', value);
    
        msg.embed(resultEmbed(msg,`Les invitations seront maintenant **${value === true ? 'autorisés' : 'interdites donc supprimés'}** !`))
        this.runProcess(msg,11)
      }).catch(error => console.log('Init command => authorizeInvites',error))
    }
    if(process === 11){
      return commandSystem(msg).then(response => {
        const value = response.response;
        msg.guild.settings.set('deletecommandmessages', value);

        msg.embed(resultEmbed(msg,`Les messages de commandes seront maintenant **${value === true ? 'supprimés' : 'laissés'}** !`))
        this.runProcess(msg,12)
      }).catch(error => console.log('Init command => commandSystem',error))
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
        if(messageReaction.message) messageReaction.message.delete();
    
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
        if(message) message.delete()
        if(question) question.delete()
        return resolve({ response: channel });
      }).catch(error => {
        if(message) message.delete()
        msg.embed(errorEmbed(msg,`Impossible de trouver le salon \`${message}\`, merci de réessayer!`)).then(m => m.delete({timeout: 3000}))
        console.log('Init command => channelWelcome in findChannel func',error)
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
        if(messageReaction.message) messageReaction.message.delete();
    
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
        if(message) message.delete()
        if(question) question.delete()
        return resolve({ response: role });
      }).catch(error => {
        message.delete({timeout: 2000})
        msg.embed(errorEmbed(msg,`Impossible de trouver le role \`${message}\`, merci de réessayer!`)).then(m => m.delete({timeout: 3000}))
        console.log('Init command => roleAuto in FindRole func',error)
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
        if(messageReaction.message) messageReaction.message.delete();
    
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
        if(messageReaction.message) messageReaction.message.delete();
    
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
          if(message) message.delete()
          msg.embed(errorEmbed(msg,`Impossible de trouver le salon \`${message}\`, merci de réessayer!`)).then(m => m.delete({timeout: 3000}))
          return;
        }
        if(message) message.delete()
        if(question) question.delete()
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
        if(messageReaction.message) messageReaction.message.delete();
    
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
        if(messageReaction.message) messageReaction.message.delete();
    
        return resolve({ response: messageReaction.emoji.name === '✅' ? true : false });
    }
  
    msg.client.on('messageReactionAdd',eventListenLevelSystemReactions)
  
    msg.client.once('cancel', () => {
      msg.client.removeListener('message', eventListenLevelSystemReactions)
      return reject('cancelled')
    })
  })
});

const levelSystemXp = (msg) => new Promise((resolve, reject) => {
  const emojis = ['0⃣','1⃣', '2⃣', '3⃣'];

  const currentXp = msg.guild.settings.get('xpCount') ? msg.guild.settings.get('xpCount') : '15:25';

  msg.embed(questionEmbed(msg,`\n
    Quel quantité d'xp souhaitez vous attribuer aux membres lorsqu'ils envoient un message ?\n 
    0⃣ | 0 xp par messages ${currentXp == '0' ? '✅' : ''}\n
    1⃣ | Entre 5 xp 15 par messages ${currentXp == '5:15' ? '✅' : ''}\n
    2⃣ | Entre 15 xp 25 par messages ${currentXp == '15:25' ? '✅' : ''}\n
    3⃣ | Entre 25 xp 35 par messages ${currentXp == '25:35' ? '✅' : ''}
  `))
  .then(async question => {
    await emojis.reduce((acc, emoji) => acc.then(() => question.react(emoji)), Promise.resolve())

    function eventListenLevelSystemXpReactions(messageReaction,user){
      if(user.bot || messageReaction.message.id !== question.id || user.id !== msg.author.id) return;
        if(!emojis.includes(messageReaction.emoji.name)){
          messageReaction.users.remove(user)
          return;
        }
        msg.client.removeListener('messageReactionAdd', arguments.callee);
        if(messageReaction.message) messageReaction.message.delete();
    
        switch (messageReaction.emoji.name) {
          case '0⃣': return resolve({response: '0'});
          case '1⃣': return resolve({response: '5:15'});
          case '2⃣': return resolve({response: '15:25'});
          case '3⃣': return resolve({response: '25:35'});
        }
        return null;
    }
  
    msg.client.on('messageReactionAdd',eventListenLevelSystemXpReactions)
  
    msg.client.once('cancel', () => {
      msg.client.removeListener('message', eventListenLevelSystemXpReactions)
      return reject('cancelled')
    })
  })
});

const commandSystem = (msg) => new Promise((resolve, reject) => {
  const emojis = ['✅','❎']

  msg.embed(questionEmbedFile(msg,'Souhaitez vous que les commandes executés par les utilisateurs soient supprimés ? *exemple ci-dessous*','https://www.draftman.fr/images/draftbot/exemples/delete_command.png'))
  .then(question => {
    question.react(emojis[0]);
    question.react(emojis[1]);

    function eventListenCommandSystemReactions(messageReaction,user){
      if(user.bot || messageReaction.message.id !== question.id || user.id !== msg.author.id) return;
        if(!emojis.includes(messageReaction.emoji.name)){
          messageReaction.users.remove(user)
          return;
        }
        msg.client.removeListener('messageReactionAdd', arguments.callee);
        if(messageReaction.message) messageReaction.message.delete();
    
        return resolve({ response: messageReaction.emoji.name === '✅' ? true : false });
    }
  
    msg.client.on('messageReactionAdd',eventListenCommandSystemReactions)
  
    msg.client.once('cancel', () => {
      msg.client.removeListener('message', eventListenCommandSystemReactions)
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