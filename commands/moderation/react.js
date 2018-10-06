const {Command} = require('discord.js-commando'),
      {MessageEmbed} = require('discord.js')

module.exports = class QuoteCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'react',
      memberName: 'react',
      group: 'moderation',
      aliases: ['ra'],
      description: 'Ajouter des roles à un message avec des réactions',
      examples: ['react 5554845515145714 '],
      guildOnly: true,
      args: [
        {
            key: 'message',
            prompt: 'A quel message souhaitez vous ajouter un role ?',
            type: 'message'
        },
        {
            key: 'role',
            prompt: 'Quel role doit être ajouté lors d\'une interaction avec une réaction',
            type: 'role'
        },
        {
          key: 'emoji',
          prompt: 'Quel emoji doit apparaitre sous le message ?',
          type: 'string'
        }
      ]
    });
  }

  async run (msg, {emoji,role,message}) {
    msg.guild.settings.set(`react-${message.id}:${emoji}`,`${role.id}`);
    console.log(emoji)
    message.react(emoji)
  }
};