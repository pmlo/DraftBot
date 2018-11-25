const {Command} = require('discord.js-commando')
const {MessageEmbed} = require('discord.js')

module.exports = class AvatarCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'guildid',
      memberName: 'guildid',
      group: 'dev',
      aliases: ['getguildid'],
      description: 'Récupérer l\'id d\'une guild',
      examples: ['guildid'],
      guildOnly: true
    });
  }

  run (msg) {
    const embed = new MessageEmbed()
      .setColor(0xcd6e57)
      .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
      .setDescription(`L'id de la guild est: \`\`\`${msg.guild.id}\`\`\``)
      .setFooter(msg.guild.name,msg.guild.iconURL({format: 'png'}))
      .setTimestamp()

    return msg.embed(embed);
  }
};