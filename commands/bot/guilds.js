const {Command} = require('discord.js-commando');
const {MessageEmbed} = require('discord.js');
const {deleteCommandMessages} = require('../../utils.js');

module.exports = class GuildsCommand extends Command {
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
    deleteCommandMessages(msg);
    const embed = new MessageEmbed()
    .setColor('#cd6e57')
    .setDescription(`Le DraftBot se trouves sur ${this.client.guilds.size} ${this.client.guilds.size > 1 ? 'serveurs' :'serveur'}`)
    .setTimestamp(msg.createdAt);

    return msg.embed(embed);
  }
};