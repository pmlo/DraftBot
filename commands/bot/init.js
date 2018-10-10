const {MessageEmbed} = require('discord.js'), 
  {Command} = require('discord.js-commando')

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

  async run (msg) {
    const configEmbed = new MessageEmbed()
      .setTitle('Configuration')
      .setAuthor(msg.author.username,msg.author.displayAvatarURL({format: 'png'}))
      .setThumbnail(msg.client.user.displayAvatarURL({format: 'png'}))
      .setColor(0xcd6e57)
      .setDescription("Bienvenue sur mon procéssus de configuration !\nJe vais vous posez une série de question me permettant de répondre aux mieux à vos besoins.\n\nVous pouvez arêter cette configuration à tout moment en envoyant \`cancel\`.")
      .setFooter("Procéssus de configuration", msg.client.user.displayAvatarURL({format: 'png'}))
      .setTimestamp()

    await msg.embed(configEmbed);
    await msg.client.on('message', this.lisenCancel(msg));
    await this.runProcess(msg, 0);
  }
  lisenCancel(msg) {
    return async (message) => {
      if(msg.author.id !== message.author.id) return;
  
      if(message.content.toLowerCase() === 'cancel'){
        await msg.client.removeListener('message', this.lisenCancel(msg));
        await msg.client.removeListener('messageReactionAdd',this.event);
        await msg.client.removeListener('message', this.lisenMessages(msg));
        message.reply('configuration annulé !')
        return false;
      }
    }
  }
  async runProcess (msg,process) {
    if(process === 0){
      const question = await msg.say({
        embed: questionEmbed(msg,'Voulez vous un message de bienvenue quand un joueur rejoinds le serveur ? *exemple ci dessous*'),
        file: 'https://www.draftman.fr/images/draftbot/exemple_welcome_message.jpg'
      })
      await this.trueFalse(msg,question,'Les messages de bienvenue sont maintenant **$1** !',1);
    }
    if(process === 1){
      await msg.embed(questionEmbed(msg,'Dans quel salon voulez vous les messages de bienvenue ?'));

      const lisenChannel = (msg) => {
        return async (message) => {
          if(msg.author.id !== message.author.id) return;
          const channel = await findChannel(message.content, msg);
          if(channel !== null) msg.client.removeListener('message', lisenChannel(msg));
          msg.guild.settings.set('welcomeChannel', channel);

          msg.embed(questionEmbed(msg,`Les messages de bienvenue seront maintenant envoyés dans le salon #${channel.name} !`))
        }
      }
      await msg.client.on('message', lisenChannel(msg));
    }
  }
  async trueFalse(msg,question,response,nextProcess){
    const emojis = ['✅','❎']
    await question.react('✅')
    await question.react('❎')

    const event = async (messageReaction,user) => {
        if(user.id === messageReaction.message.client.user.id) return;
        if(messageReaction.message.id === question.id){
          if(emojis.includes(messageReaction.emoji.name)){
            await question.delete();
            
            const embed = new MessageEmbed()
            .setAuthor(user.username,user.displayAvatarURL({format: 'png'}))
            .setColor(0xcd6e57)
            .setDescription(response.replace('$1',messageReaction.emoji.name === '✅' ? 'activés' : 'désactivés'))
            .setFooter("Procéssus de configuration", msg.client.user.displayAvatarURL({format: 'png'}))
            .setTimestamp()
      
            await msg.say(embed)
            
            question.client.removeListener('messageReactionAdd',event);
            
            return this.runProcess(msg,1,nextProcess)

          } else{
            messageReaction.users.remove(user)
          }
        }
    }

    return question.client.on('messageReactionAdd',event);
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

const questionEmbed = (msg, question) => {
  const embed = new MessageEmbed()
  .setAuthor(msg.author.username,msg.author.displayAvatarURL({format: 'png'}))
  .setColor(0x39d600)
  .setDescription(question)
  .setFooter("Procéssus de configuration", msg.client.user.displayAvatarURL({format: 'png'}))
  .setTimestamp()
  return embed;
}