const {Command} = require('discord.js-commando'), 
  {MessageEmbed} = require('discord.js')

module.exports = class AvatarCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'guilds',
      memberName: 'guilds',
      group: 'utils',
      aliases: ['guildslist'],
      description: 'Afficher la liste de mes serveurs',
      examples: ['guilds']
    });
  }

  run (msg) {
    const embed = new MessageEmbed()
    .setColor('#cd6e57')
    .setTitle(`${this.client.guilds.size} ${this.client.guilds.size > 1 ? 'serveurs' :'serveur'}`)
    .setDescription(this.client.guilds.map(m => m.name).join('\n'))
    .setTimestamp(msg.createdAt);

    msg.delete()
    return msg.embed(embed);
  }
};