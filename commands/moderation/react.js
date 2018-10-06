const {Command} = require('discord.js-commando'),
      {MessageEmbed,Util} = require('discord.js')

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

    const newEmoji = Util.parseEmoji(emoji),
          reactEmbed = new MessageEmbed()

    msg.delete()

    msg.channel.messages.fetch(message.id).then(focusMsg=> {
      const embed = focusMsg.embeds[0];

      embed.setDescription(embed.description ? `${embed.description} | ${role.name}` : role.name)
      focusMsg.edit('', {embed});
    })

    msg.guild.settings.set(`react-${message.id}:${newEmoji.id}`,`${role.id}`);

    message.react(newEmoji.id ? newEmoji.id : newEmoji.name)

    reactEmbed
      .setColor(0xcd6e57)
      .setAuthor(msg.author.username, msg.author.displayAvatarURL())
      .setDescription(`**Action:** L'émoji ${newEmoji.id ? `<:${newEmoji.name}:${newEmoji.id}>` : newEmoji.name} à été attributé au role ${role.name} sur le selectionneur de roles !`)
      .setTimestamp();

    return msg.embed(reactEmbed).then(actionMessage => actionMessage.delete({timeout: 8000}))
  }
};