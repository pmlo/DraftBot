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
    return (message) => {
      if(msg.author.id !== message.author.id) return;
  
      if(message.content.toLowerCase() === 'cancel'){
        message.reply('configuration annulé !')
        return msg.client.removeListener('message', this.lisenCancel(msg))
      }
    }
  }
  lisenMessages(msg) {
    return (message) => {
      if(msg.author.id !== message.author.id) return;
      return message;
    }
  }
  async runProcess (msg,process) {
    if(process === 0){
      const question = await msg.say('Voulez vous un message de bienvenue quand un joueur rejoinds le serveur ? *exemple ci dessous*',{
        file: 'https://www.draftman.fr/images/draftbot/exemple_welcome_message.jpg'
      })
      await this.trueFalse(question,'Les messages de bienvenue sont maintenant **$1** !');
      this.runProcess(msg,1)
    }
    if(process === 1){
      await msg.say('Dans quel salon voulez vous les messages de bienvenue ?');
      const message = await msg.client.on('message', this.lisenMessages(msg));
      const channel = await findChannel(message);
      if(channel !== null) msg.client.removeListener('message', this.lisenMessages(msg));
      msg.guild.settings.set('welcomeChannel', channel);

      const embed = new MessageEmbed()
      .setAuthor(user.username,msg.displayAvatarURL({format: 'png'}))
      .setColor(0xcd6e57)
      .setDescription(`Les messages de bienvenue seront maintenant envoyés dans le salon #${channel.name} !`)
      .setFooter("Procéssus de configuration", msg.client.user.displayAvatarURL({format: 'png'}))
      .setTimestamp()
      msg.say(embed)
      return msg.client.removeListener('message', this.lisenCancel(msg))
    }

    await msg.client.on('message', this.lisenResponse(msg));
  }
  async trueFalse(question,response){
    const emojis = ['✅','❎']
    await question.react('✅')
    await question.react('❎')
    question.client.on('messageReactionAdd',this.event);

    const event = () => {
      return async (messageReaction,user) => {
        if(messageReaction.message.id === question.id){
          if(emojis.includes(messageReaction.name)){
            await question.delete();
            
            const embed = new MessageEmbed()
            .setAuthor(user.username,msg.displayAvatarURL({format: 'png'}))
            .setColor(0xcd6e57)
            .setDescription(response.replace('$1',messageReaction.name === '✅' ? 'activés' : 'désactivés'))
            .setFooter("Procéssus de configuration", msg.client.user.displayAvatarURL({format: 'png'}))
            .setTimestamp()
      
            await question.say(embed)
            
            return question.client.removeListener('messageReactionAdd',event);

          } else{
            messageReaction.remove(user)
          }
        }
      }
    }
  }
};

const findChannel = (val, msg) => {
  const matches = val.match(/^(?:<#)?([0-9]+)>?$/);
  if(matches) return msg.guild.channels.get(matches[1]) || null;
  const search = val.toLowerCase();
  const channels = msg.guild.channels.filter(nameFilterInexact(search));
  if(channels.size === 0) return null;
  if(channels.size === 1) return channels.first();
  const exactChannels = channels.filter(nameFilterExact(search));
  if(exactChannels.size === 1) return exactChannels.first();
  return null;
}

const nameFilterExact = (search) => {
	return thing => thing.name.toLowerCase() === search;
}

const nameFilterInexact = (search) => {
	return thing => thing.name.toLowerCase().includes(search);
}