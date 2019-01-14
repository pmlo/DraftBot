const {Command} = require('discord.js-commando');
const {MessageEmbed} = require('discord.js');
const {deleteCommandMessages} = require('../../utils.js');

module.exports = class AvatarCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'groups',
      memberName: 'groups',
      group: 'bot',
      aliases: ['list-groups', 'show-groups','commandes-groups','commands-groups'],
      description: 'Afficher tous les groupes de commandes',
      examples: ['groups']
    });
  }

  run (msg) {
    deleteCommandMessages(msg);
    const embed = new MessageEmbed()
    .setColor(0xcd6e57)
    .setTitle('Groupes')
    .setDescription(this.client.registry.groups.map(grp => `**${grp.name}:** ${grp.isEnabledIn(msg.guild) ? 'Activé' : 'Désactivé'}`).join('\n'))
    .setTimestamp(msg.createdAt);

    return msg.embed(embed);
  }
};