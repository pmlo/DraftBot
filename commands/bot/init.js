const { MessageEmbed } = require('discord.js')
const { Command } = require('discord.js-commando')
const { stripIndents } = require('common-tags')
const { findChannel } = require('../../utils.js')

module.exports = class InitCommand extends Command {
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
    msg.client.on('message', eventCancel(msg));
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
    return stopCommand(current)(msg)
  }
};

/* 
* Etapes de la commande 
*
* Différents étapes de pour avoir les réponses de l'utilisateur
*/

const welcomeMessage = (current) => async (msg,process) => {
  const emojis = ['✅','❎']

  const question = await msg.say({
    embed: questionEmbed(msg,'Voulez vous un message de bienvenue quand un joueur rejoinds le serveur ? *exemple ci dessous*'),
    file: 'https://www.draftman.fr/images/draftbot/exemple_welcome_message.jpg'
  })
  
  await Promise.all(emojis.map(emoji => question.react(emoji)));
  await msg.client.on('messageReactionAdd',eventListenReactions(current)(msg,question,emojis,process));
}


const channelWelcome = (current) => async (msg,process) => {
  const question = await msg.embed(questionEmbed(msg,'Dans quel salon voulez vous les messages de bienvenue ?'));
  await msg.client.on('message',eventListenChannel(current)(msg,question,process));
}

/* 
* Events des étapes
*
* Différents events pour capturer les réponses de l'utilisateur
*/

const eventListenChannel = (current) => (msg,question,process) => {
  const nextProcess = process + 1;
  return async (message) => {
    if(msg.author.id !== message.author.id) return;
    const channel = await findChannel(message.content, msg);
    if(channel === null) {
      message.delete({timeout: 2000})
      msg.embed(errorEmbed(msg,`Impossible de trouver le salon \`${message}\`, merci de réessayer!`)).then(m => m.delete({timeout: 3000}))
      return;
    }else{
      msg.client.removeListener('message', eventListenChannel(current)(msg));
      question.delete();
      message.delete();
    }
    msg.guild.settings.set('welcomeChannel', channel);

    msg.embed(resultEmbed(msg,`Les messages de bienvenue seront maintenant envoyés dans le salon #${channel.name} !`))
    current.runProcess(msg,nextProcess)
  }
}

const eventListenReactions = (current) => (msg,question,reactions,process) => {
  const nextProcess = process + 1;
  return async (messageReaction,user) => {
    if(user.bot) return;
    if(messageReaction.message.id !== question.id) return;
    if(!reactions.includes(messageReaction.emoji.name)){
      messageReaction.users.remove(user)
      return;
    }
    msg.client.removeListener('message', eventListenReactions(current)(msg,question,reactions,process));
    messageReaction.message.delete();

    const response = messageReaction.emoji.name === '✅' ? true : false;

    await msg.guild.settings.set('welcomeMessage', response);

    await msg.embed(resultEmbed(msg,`Les messages de bienvenue sont maintenant **${response === true ? 'activés' : 'désactivés'}** !`))
    current.runProcess(msg, response === true ? nextProcess : nextProcess+1)
  }
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
      return stopCommand(msg);
    }
  }
}

const stopCommand = (current) => async (msg) => {
  msg.client.removeListener('message', eventCancel(msg));
  msg.client.removeListener('message', eventListenReactions(current)(msg,null,[],1000));
  msg.client.removeListener('messageReactionAdd',eventListenChannel(current)(msg,1000));
  return;
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