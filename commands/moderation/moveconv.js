const {Command} = require('discord.js-commando');
const {MessageEmbed} = require('discord.js');

module.exports = class MoveConvCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'moveconv',
      memberName: 'moveconv',
      group: 'moderation',
      aliases: ['movemessages','move'],
      description: 'Déplacer des messages dans un autre salon',
      examples: ['moveconv 10 #javascript'],
      guildOnly: true,
      args: [{
				key: 'messages',
				prompt: 'Combien de messages souhaitez vous déplacer ?',
        type: 'integer',
        min: 1,
        max: 50
      },
      {
				key: 'channel',
				prompt: 'Dans quel channel souhaitez vous déplacer ces messages ?',
        type: 'channel'
			}],
      clientPermissions: ['MANAGE_MESSAGES'],
      userPermissions: ['MANAGE_MESSAGES']
    });
  }

  async run (msg, {messages,channel}) {
    msg.delete()
    const oldChannel = msg.guild.channels.get(msg.channel.id);

    channel.fetchWebhooks().then(async webhooks => {
      let hook = webhooks.find(hook => hook.name === 'DraftBot')
      if(!hook){
       hook = await channel.createWebhook('DraftBot')
      }

      channel.send('',{embed: new MessageEmbed()
      .setColor(0xcd6e57)
      .setDescription(`Conversation déplacé du salon #${oldChannel.name}`)
      .setFooter(msg.guild.name,msg.guild.iconURL({format: 'png'}))
      .setTimestamp()})

      oldChannel.messages.fetch({ limit: messages + 1 }).then(messages => {
        const brut = messages.array()
        brut.shift()
        const messagesList = brut.reverse()
        messagesList.forEach(message => {
          hook.send({
            'username': message.author.username, 
            'avatarURL': message.author.avatarURL(),
            'content': message.content,
            'embeds': message.embeds
          })
          message.delete()
        });
      });
    })
  }
};