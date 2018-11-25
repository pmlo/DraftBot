const {Command} = require('discord.js-commando');
const {MessageEmbed} = require('discord.js');

module.exports = class ClearCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'clear',
      memberName: 'clear',
      group: 'moderation',
      aliases: ['purge','prune', 'delete','clean'],
      description: 'Supprimer des messages en masse',
      examples: ['clear 5'],
      guildOnly: true,
      args: [{
        key: 'amount',
        prompt: 'Combien de messages voulez vous supprimer de messages',
        min: 1,
        max: 100,
        type: 'integer'
      }],
      clientPermissions: ['MANAGE_MESSAGES'],
      userPermissions: ['MANAGE_MESSAGES']
    });
  }

  async run (msg, {amount}) {
    amount = amount === 100 ? 99 : amount;
    msg.channel.bulkDelete(amount + 1).then(msgs => {
      msg.say(`\`${msgs.size} messages supprimés\``).then(message => message.delete({timeout: 2000}))
    }).catch(err => {
      if(err.message === 'You can only bulk delete messages that are under 14 days old.'){
        return clearChannel(msg).then(response => {
          const value = response.response;
          if(value === true){
            return msg.channel.clone(undefined, true, true, 'Messages supprimés').then(async clone => {
              await msg.channel.delete();
              await clone.setPosition(msg.channel.calculatedPosition)
              await clone.send(`${msg.author}, la tache est maintenant terminé. Tous les messages ont été supprimés !`)
            })
          }
        }).catch(error => console.log(error))
      }
    })
  }
};

const clearChannel = (msg) => new Promise((resolve, reject) => {
  const emojis = ['✅','❎']

  const embed = new MessageEmbed()
  .setColor(0xcd6e57)
  .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
  .setDescription(`Je ne peux pas supprimer des messages dattant de plus de 14 jours mais je peux vider entièrement le salon si vous le souhaitez !\nLe souhaitez vous ?`)
  .setFooter(msg.guild ? msg.guild.name : '',msg.guild ? msg.guild.iconURL({format: 'png'}) : msg.client.user.avatarURL({format: 'png'}))
  .setTimestamp()

  msg.embed(embed).then(question=>{
    question.react(emojis[0]);
    question.react(emojis[1]);

    function eventListenClearChannelReactions(messageReaction,user){
        if(user.bot || messageReaction.message.id !== question.id || user.id !== msg.author.id) return;
        if(!emojis.includes(messageReaction.emoji.name)){
          messageReaction.users.remove(user)
          return;
        }
        msg.client.removeListener('messageReactionAdd', arguments.callee);
        messageReaction.message.delete();
    
        return resolve({ response: messageReaction.emoji.name === '✅' ? true : false });
    }
  
    msg.client.on('messageReactionAdd',eventListenClearChannelReactions)
  })
});