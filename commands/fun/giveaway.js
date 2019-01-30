const { MessageEmbed } = require('discord.js')
const { Command } = require('discord.js-commando')
const { stripIndents } = require('common-tags')
const Database = require('better-sqlite3');
const path = require('path');
const {deleteCommandMessages,parseShortTime,deleteM} = require('../../utils.js')
const moment = require('moment');
moment().locale('fr');

module.exports = class InitCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'giveaway',
      memberName: 'giveaway',
      group: 'bot',
      aliases: ['give-away'],
      description: 'Créer un giveaway sur le serveur',
      examples: ['giveaway'],
      guildOnly: true,
      userPermissions: ['MANAGE_MESSAGES']
    });
    
    this.timer = 0;
    this.giveaway = {};
    this.messages = []
  }

  async run (msg) {
    deleteCommandMessages(msg);
    const giveawayEmbed = new MessageEmbed()
      .setTitle('Création du giveaway')
      .setAuthor(msg.author.username,msg.author.displayAvatarURL({format: 'png'}))
      .setThumbnail(msg.client.user.displayAvatarURL({format: 'png'}))
      .setColor(0xcd6e57)
      .setDescription(
      stripIndents`
        Bienvenue sur mon procéssus de création d'un giveaway !
        Je vais vous poser une série de question me permettant de créer le giveaway dont vous avez besoin.
        
        Vous pouvez arrêter cette création à tout moment en envoyant \`cancel\` ou en attendant 30 secondes après la question.
      `)
      .setFooter("Création d'un giveaway", msg.client.user.displayAvatarURL({format: 'png'}))
      .setTimestamp()

    this.messages.push(await msg.embed(giveawayEmbed));
    msg.client.on('message', eventCancel);

    function eventCancel(message){
      if(msg.author.id !== message.author.id) return;

      if(message.content.toLowerCase() === 'cancel'){
        message.reply('Création du giveaway annulée !')
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

  async runProcess (msg,process) {
    startNewTimer(msg);

    const db = new Database(path.join(__dirname, '../../storage.sqlite'));

    if(process === 1){
      return timeGiveaway(msg).then(async response => {
        const value = response.response
        this.giveaway.time = value;
        this.messages.push(await msg.embed(resultEmbed(msg,`Le giveaway durera **${value}** minutes !`)));
        this.runProcess(msg, 2);
      }).catch(error => console.log('giveaway command => timeGiveaway',error))
    }
    if(process === 2){
      return rewardGiveaway(msg).then(async response => {
        const value = response.response
        this.giveaway.reward = value;
        this.messages.push(await msg.embed(resultEmbed(msg,`La récompense du giveaway sera **${value}** !`)))
        this.runProcess(msg, 3);
      }).catch(error => console.log('giveaway command => rewardGiveaway',error))
    }

    // Il n'y pas plus de process
    this.messages.push(await msg.embed(questionEmbed(msg,'Félicitation, le giveaway est maintenant crée !')))
    stopTimer()
    msg.client.emit('cancel')

    const end = moment().add(this.giveaway.time, 'm').format();
    const timer = moment().minute(this.giveaway.time).fromNow();
    const embed = new MessageEmbed()
    .setColor(0xcd6e57)
    .setTitle(`🎉 **Giveaway**: ${this.giveaway.reward}`)
    .setDescription(stripIndents`
      Pour participer au giveaway et tenter de gagner la récompense veuillez réagir avec la réaction 🎉 !\n\nLe giveaway prendra fin **${timer}**`)
    .setFooter(msg.guild.name,msg.guild.iconURL({format: 'png'}))
    .setTimestamp();

    const message = await msg.embed(embed)
    message.react('🎉')

    db.prepare(`INSERT INTO "giveaway"(guild, channel,user, message, reward, end, status, date) VALUES ($guild, $channel, $user, $message, $reward, $end, $status, $date)`).run({
      guild: msg.guild.id,
      channel: msg.channel.id,
      user: msg.author.id,
      message: message.id,
      reward: `${this.giveaway.reward}`,
      end: end,
      status: 0,
      date: `${new Date()}`
    })

    msg.channel.bulkDelete(this.messages).catch(err => console.log('giveaway burkDelete bug',err))
  }
};

/* 
* Etapes de la commande 
*
* Différents étapes de pour avoir les réponses de l'utilisateur
*/

const timeGiveaway = (msg) => new Promise((resolve, reject) => {
  msg.embed(questionEmbed(msg,'Combien de temps doit durer le giveaway (en minutes) ?'))
  .then(question => {
    function eventListenToTime(message){
      const func = arguments.callee
      if(msg.author.id !== message.author.id) return;
      parseShortTime(message.content).then(response => {
        const time = response.response;
        msg.client.removeListener('message', func);
        if(message) message.delete()
        if(question) question.delete()
        return resolve({ response: time });
      }).catch(error => {
        deleteM(message);
        msg.embed(errorEmbed(msg,`La valeur \`${message}\` est invalide, merci de réessayer!`)).then(deleteM)
        console.log('Giveaway command => timeGiveaway in parseShortTime func',error)
        return;
      })
    }
  
    msg.client.on('message',eventListenToTime)
  
    msg.client.once('cancel', () => {
      msg.client.removeListener('message', eventListenToTime)
      return reject('cancelled')
    })
  })
});

const rewardGiveaway = (msg) => new Promise((resolve, reject) => {
  msg.embed(questionEmbed(msg,'Quelle est la récompense du giveaway ?'))
  .then(question=>{
    function eventListenReward(message){
      if(msg.author.id !== message.author.id) return;

      msg.client.removeListener('message', eventListenReward);
      if(message) message.delete()
      if(question) question.delete()
      return resolve({ response: message });
    }
  
    msg.client.on('message',eventListenReward)
  
    msg.client.once('cancel', () => {
      msg.client.removeListener('message', eventListenReward)
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
  .setFooter("Création d'un giveaway", msg.client.user.displayAvatarURL({format: 'png'}))
  .setTimestamp()
}

const errorEmbed = (msg, message) => {
  return new MessageEmbed()
  .setAuthor(msg.author.username,msg.author.displayAvatarURL({format: 'png'}))
  .setColor(0xce0000)
  .setDescription(message)
  .setFooter("Création d'un giveaway", msg.client.user.displayAvatarURL({format: 'png'}))
  .setTimestamp();
}

const resultEmbed = (msg, conclusion) => {
  return new MessageEmbed()
  .setAuthor(msg.author.username,msg.author.displayAvatarURL({format: 'png'}))
  .setColor(0xcd6e57)
  .setDescription(conclusion)
  .setFooter("Création d'un giveaway", msg.client.user.displayAvatarURL({format: 'png'}))
  .setTimestamp();
}