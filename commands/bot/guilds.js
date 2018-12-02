const {Command} = require('discord.js-commando'), 
  {MessageEmbed} = require('discord.js')

module.exports = class AvatarCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'guildscount',
      memberName: 'guildscount',
      group: 'bot',
      aliases: ['guilds','guildsnbr','serveurs','serveursnbr'],
      description: 'Afficher le nombre de serveurs du DraftBot',
      examples: ['guildscount']
    });
  }

  run (msg) {
    const embed = new MessageEmbed()
    .setColor('#cd6e57')
    .setDescription(`Le DraftBot se trouves sur ${this.client.guilds.size} ${this.client.guilds.size > 1 ? 'serveurs' :'serveur'}`)
    .setTimestamp(msg.createdAt);

    msg.delete()
    return msg.embed(embed);
  }
};