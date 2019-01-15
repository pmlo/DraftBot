const {Command} = require('discord.js-commando');
const {sendLogsBot,deleteCommandMessages} = require('../../utils.js');
const {MessageEmbed} = require('discord.js');

module.exports = class WelcomeCommand extends Command {
  constructor (client) {  
    super(client, {
      name: 'level-admin',
      memberName: 'level-admin',
      group: 'configuration',
      aliases: ['admin-level','admin-levels','levels-admin'],
      description: 'Activer ou désactiver le système de niveaux sur le serveur.',
      examples: ['level-admin'],
      guildOnly: true,
      args: [{
				key: 'config',
				prompt: 'Voulez vous redéfinir l\'xp atribué aux membres lors de l\'envoie d\'un message ?',
        type: 'string',
        default: ''
			}],
      userPermissions: ['ADMINISTRATOR']
    });
    this.timer = 0;
  }

  async run (msg,{config}) {
    deleteCommandMessages(msg);
    let description;
    if(!config || config === 'toggle'){
      if (msg.guild.settings.get('levelSystem') !== false) {
        msg.guild.settings.set('levelSystem', false);
        description = `🎉 Le système de niveaux est maintenant **désactivé** !`;
      }else{
        msg.guild.settings.set('levelSystem',true);
        description = `🎉 Le système de niveaux est maintenant **activé** !`;
      }
      return sendLogsBot(msg, description)
    }else{
      if(msg.guild.settings.get('levelSystem') == false){
        return msg.reply(`Le système de levels est actuellement désactivé, pour le réactiver veuillez utiliser \`${msg.guild.commandPrefix}level-admin\` !`)
      }

      return getValue(msg).then(response => {
        const value = response.response;
        msg.guild.settings.set('xpCount', value);
        const sValue = value.split(':')
        stopTimer();
        if(value === '0'){
          return sendLogsBot(msg,`L'xp attribué sera de \`${value}\` !`);
        }
        return sendLogsBot(msg,`L'xp attribué sera entre  \`${sValue[0]}\` et \`${sValue[1]}\` !`);
      }).catch(error => console.log('Level-admin command => ',error))
    }
  }
};

const getValue = (msg) => new Promise((resolve, reject) => {
  const emojis = ['0⃣','1⃣', '2⃣', '3⃣'];
  startNewTimer(msg)
  const currentXp = msg.guild.settings.get('xpCount') ? msg.guild.settings.get('xpCount') : '15:25';

  const embed = new MessageEmbed()
  .setAuthor(msg.author.username,msg.author.displayAvatarURL({format: 'png'}))
  .setColor(0xcd6e57)
  .setDescription(`\n
    Quel quantité d'xp souhaitez vous attribuer aux membres lorsqu'ils envoient un message ? *(30 secondes pour répondre)*\n 
    0⃣ | 0 xp par messages ${currentXp == '0' ? '✅' : ''}\n
    1⃣ | Entre 5 xp 15 par messages ${currentXp == '5:15' ? '✅' : ''}\n
    2⃣ | Entre 15 xp 25 par messages ${currentXp == '15:25' ? '✅' : ''}\n
    3⃣ | Entre 25 xp 35 par messages ${currentXp == '25:35' ? '✅' : ''}
  `)
  .setFooter(msg.guild ? msg.guild.name : '',msg.guild ? msg.guild.iconURL({format: 'png'}) : msg.client.user.avatarURL({format: 'png'}))
  .setTimestamp()

  msg.embed(embed)
  .then(async question => {
    await emojis.reduce((acc, emoji) => acc.then(() => question.react(emoji)), Promise.resolve())

    function eventListenXpReactions(messageReaction,user){
        if(user.bot || messageReaction.message.id !== question.id || user.id !== msg.author.id) return;
        if(!emojis.includes(messageReaction.emoji.name)){
          messageReaction.users.remove(user)
          return;
        }
        msg.client.removeListener('messageReactionAdd', arguments.callee);
        messageReaction.message.delete();

        switch (messageReaction.emoji.name) {
          case '0⃣': return resolve({response: '0'});
          case '1⃣': return resolve({response: '5:15'});
          case '2⃣': return resolve({response: '15:25'});
          case '3⃣': return resolve({response: '25:35'});

          default: console.log('erreur dans level admin');
          return null;
        }
    }
  
    msg.client.on('messageReactionAdd',eventListenXpReactions)
  
    msg.client.once('cancel', () => {
      msg.client.removeListener('message', eventListenXpReactions)
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