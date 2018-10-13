const { MessageEmbed } = require('discord.js')
const { Command } = require('discord.js-commando')
const {oneLine, stripIndents} = require('common-tags')

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
    msg.client.on('message', listenCancel(msg));
    this.runProcess(msg, 0);
  }

  async runProcess (msg,process) {
    if(process === 0){
      const question = await msg.say({
        embed: questionEmbed(msg,'Voulez vous un message de bienvenue quand un joueur rejoinds le serveur ? *exemple ci dessous*'),
        file: 'https://www.draftman.fr/images/draftbot/exemple_welcome_message.jpg'
      })
      return msg.client.on('messageReactionAdd', await affirmativeQuestion(msg,question,'Les messages de bienvenue sont maintenant **$1** !',1));
    }
    if(process === 1){
      await msg.embed(questionEmbed(msg,'Dans quel salon voulez vous les messages de bienvenue ?'));
      return msg.client.on('message', listenChannel(msg));
    }
    console.log('no process')
    msg.embed(questionEmbed(msg,'Félicitation la configuration est terminé, merci !'))
    return stopCommand(msg)
  }
};

const findChannel = (val, msg) => {
  const matches = val.match(/^(?:<#)?([0-9]+)>?$/);
  if(matches) return msg.guild.channels.get(matches[1]) || null;
  const search = val.toLowerCase();
  const channels = msg.guild.channels.filter(thing => thing.name.toLowerCase().includes(search));
  if(channels.size === 0) return null;
  if(channels.size === 1) return channels.first();
  const exactChannels = channels.filter(filter => filter.name.toLowerCase() === search);
  if(exactChannels.size === 1) return exactChannels.first();
  return null;
}

const affirmativeQuestion = async (msg,question,response,nextProcess) => {
  const emojis = ['✅','❎']
  await Promise.all(emojis.map((emoji) => question.react(emoji)));
  return async (messageReaction,user) => {
    if(user.bot) return;
    if(messageReaction.message.id === question.id){
      if(emojis.includes(messageReaction.emoji.name)){
        
        const embed = new MessageEmbed()
        .setAuthor(user.username,user.displayAvatarURL({format: 'png'}))
        .setColor(0xcd6e57)
        .setDescription(response.replace('$1',messageReaction.emoji.name === '✅' ? 'activés' : 'désactivés'))
        .setFooter("Procéssus de configuration", msg.client.user.displayAvatarURL({format: 'png'}))
        .setTimestamp()

        await msg.say(embed)
        
        question.client.removeListener('messageReactionAdd',await affirmativeQuestion(msg,question,response,nextProcess));
        
        await messageReaction.message.delete();

        this.runProcess(msg,messageReaction.emoji.name === '✅' ? nextProcess : nextProcess+1)
      } else{
        messageReaction.users.remove(user)
      }
    }
  }
}

const listenChannel = (msg) => {
  return async (message) => {
    if(msg.author.id !== message.author.id) return;
    const channel = await findChannel(message.content, msg);
    if(channel === null) {
      message.delete({timeout: 2000})
      return msg.embed(errorEmbed(msg,`Impossible de trouver le salon \`${message}\`, merci de réessayer!`)).then(m => m.delete({timeout: 3000}))
    }else{
      msg.client.removeListener('message', listenChannel(msg));
    }
    msg.guild.settings.set('welcomeChannel', channel);

    msg.embed(questionEmbed(msg,`Les messages de bienvenue seront maintenant envoyés dans le salon #${channel.name} !`))
    return this.runProcess(msg,2)
  }
}

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

const stopCommand = (msg) => {
  msg.client.removeListener('message', listenCancel(msg));
  msg.client.removeListener('messageReactionAdd',affirmativeQuestion(msg));
  msg.client.removeListener('message', listenChannel(msg));
  return this.run(msg)
}

const listenCancel = (msg) => {
  return (message) => {
    if(msg.author.id !== message.author.id) return;

    if(message.content.toLowerCase() === 'cancel'){
      message.reply('configuration annulé !')
      return stopCommand(msg);
    }
  }
}