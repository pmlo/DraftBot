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
      guildOnly: true
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
    msg.client.once('message', eventCancel(msg));
    this.runProcess(msg, 1);
  }

  async runProcess (msg,process) {
    const current = this;
    if(process === 1){
      return welcomeMessage(current)(msg,process)
    }
    if(process === 2){
      return channelWelcome(current)(msg,process)
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

const welcomeMessage = (current) => async (msg,process) => {
  const nextProcess = process + 1;
  const emojis = ['✅','❎']

  const question = await msg.say({
    embed: questionEmbed(msg,'Voulez vous un message de bienvenue quand un joueur rejoinds le serveur ? *exemple ci dessous*'),
    file: 'https://www.draftman.fr/images/draftbot/exemple_welcome_message.jpg'
  })
  
  await Promise.all(emojis.map(emoji => question.react(emoji)));

  eventListenReactions(msg,question,emojis).then(response => {
    msg.guild.settings.set('welcomeMessage', response);

    msg.embed(resultEmbed(msg,`Les messages de bienvenue sont maintenant **${response === true ? 'activés' : 'désactivés'}** !`))
    current.runProcess(msg, response === true ? nextProcess : nextProcess+1)
  })
}


const channelWelcome = (current) => async (msg,process) => {
  const nextProcess = process + 1;
  await msg.embed(questionEmbed(msg,'Dans quel salon voulez vous les messages de bienvenue ?'));

  eventListenChannel(msg).then(channel => {
    msg.guild.settings.set('welcomeChannel', channel);

    msg.embed(resultEmbed(msg,`Les messages de bienvenue seront maintenant envoyés dans le salon #${channel.name} !`))
    current.runProcess(msg,nextProcess)
  })
}

/* 
* Events des étapes
*
* Différents events pour capturer les réponses de l'utilisateur
*/

const eventListenChannel = (msg) => {
  return new Promise((resolve, reject) => function (message) {
    const func = arguments.callee
    if(msg.author.id !== message.author.id) return;
    findChannel(message.content, msg).then(channel => {
      if(channel === null) {
        message.delete({timeout: 2000})
        msg.embed(errorEmbed(msg,`Impossible de trouver le salon \`${message}\`, merci de réessayer!`)).then(m => m.delete({timeout: 3000}))
        return;
      }else{
        msg.client.removeListener('message', func);
      }
      msg.client.once('cancel', () => {
        msg.client.removeListener('message', func)
        return reject('cancelled')
      })
      return resolve({ channel });
    })
  })
}

const eventListenReactions = (msg,question,reactions) => {
  return new Promise((resolve, reject) => function (messageReaction,user) {
    const func = arguments.callee
    if(user.bot) return;
    if(messageReaction.message.id !== question.id) return;
    if(reactions.includes(messageReaction.emoji.name)){
      messageReaction.users.remove(user)
      return;
    }
    msg.client.removeListener('message', func);
    messageReaction.message.delete();

    msg.client.once('cancel', () => {
      msg.client.removeListener('message', func)
      return reject('cancelled')
    })

    return resolve({ reponse: messageReaction.emoji.name === '✅' ? true : false });
  })
}

/* 
* Events Cancel & Stop
*
* Différents events pour mener à bien le procéssus de la commande
*/

const eventCancel = (msg) => {
  return (message) => {
    if(msg.author.id !== message.author.id) return;

    if(message.content.toLowerCase() === 'cancel'){
      message.reply('configuration annulé !')
      msg.client.emit('cancel')
    }
  }
}

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