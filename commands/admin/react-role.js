const {Command} = require('discord.js-commando'),
      {MessageEmbed} = require('discord.js')

module.exports = class QuoteCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'react-role',
      memberName: 'react-role',
      group: 'admin',
      aliases: ['rr'],
      description: 'Créer un message avec des réactions',
      examples: ['quote 5554845515145714'],
      guildOnly: true,
      args: [
        {
            key: 'titre',
            prompt: 'Quel titre voulez vous ?',
            type: 'string'
        }
      ]
    });
  }

  async run (msg, {titre}) {

    msg.delete()

    const embed = new MessageEmbed()
    .setColor(0xcd6e57)
    .setTitle(titre)
    .setFooter(`Choisissez vos roles en interagissant avec les réactions !`)

    const focus = await msg.channel.send('',embed)
    
    const help = new MessageEmbed()
      .setColor(0xcd6e57)
      .setAuthor(msg.author.username, msg.author.displayAvatarURL())
      .setDescription(`**Astuce:** Pour ajouter des roles \`${msg.guild.commandPrefix}react ${focus.id} <role> <emoji>\``)
      .setTimestamp();

    msg.embed(help).then(actionMessage => actionMessage.delete({timeout: 8000}))
  }
};