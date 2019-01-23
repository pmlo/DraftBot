const {Command} = require('discord.js-commando')
const {MessageEmbed} = require('discord.js');
const {deleteCommandMessages} = require('../../utils.js');

module.exports = class GetGuildIdCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'guildid',
      memberName: 'guildid',
      group: 'dev',
      aliases: ['getguildid'],
      description: 'Récupérer l\'ID d\'une guild',
      examples: ['guildid'],
      guildOnly: true
    });
  }

  run (msg) {
    deleteCommandMessages(msg);
    const embed = new MessageEmbed()
      .setColor(0xcd6e57)
      .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
      .setDescription(`L'ID de la guild est: \`\`\`${msg.guild.id}\`\`\``)
      .setFooter(msg.guild.name,msg.guild.iconURL({format: 'png'}))
      .setTimestamp()

    return msg.embed(embed);
  }
};