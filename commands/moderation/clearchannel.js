const {Command} = require('discord.js-commando');
const {MessageEmbed} = require('discord.js');

module.exports = class ClearCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'clearchannel',
      memberName: 'clearchannel',
      group: 'moderation',
      aliases: ['clearchan','clearchann', 'cleartextchannel'],
      description: 'Vider un salon textuel',
      examples: ['clearchannel'],
      guildOnly: true,
      clientPermissions: ['MANAGE_MESSAGES'],
      userPermissions: ['MANAGE_MESSAGES']
    });
  }

  async run (msg) {
    clearChannel(msg).then(response => {

      const value = response.response;
      const pos = msg.channel.position;
      if(value === true){
        return msg.channel.clone(undefined, true, true, 'Messages supprimés').then(async clone => {
          await msg.channel.delete();
          await clone.setPosition(pos)
          await clone.send(`${msg.author}, la tache est maintenant terminé. Tous les messages ont été supprimés !`)
        })
      }
    }).catch(error => console.log(error))
  }
};

const clearChannel = (msg) => new Promise((resolve, reject) => {
  const emojis = ['✅','❎']

  const embed = new MessageEmbed()
  .setColor(0xcd6e57)
  .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
  .setDescription(`Etes vous sûr de vouloir vider entièrement le salon ?`)
  .setFooter(msg.guild.name,msg.guild.iconURL({format: 'png'}))
  .setTimestamp()

  msg.embed(embed).then(question=>{
    question.react(emojis[0]);
    question.react(emojis[1]);

    function eventListenCClearChannelReactions(messageReaction,user){
        if(user.bot || messageReaction.message.id !== question.id || user.id !== msg.author.id) return;
        if(!emojis.includes(messageReaction.emoji.name)){
          messageReaction.users.remove(user)
          return;
        }
        msg.client.removeListener('messageReactionAdd', arguments.callee);
        messageReaction.message.delete();
    
        return resolve({ response: messageReaction.emoji.name === '✅' ? true : false });
    }
  
    msg.client.on('messageReactionAdd',eventListenCClearChannelReactions)
  })
});