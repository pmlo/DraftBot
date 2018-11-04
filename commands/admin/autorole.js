const {Command} = require('discord.js-commando');
const {sendLogs} = require('../../utils.js');

module.exports = class autoroleCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'autorole',
      memberName: 'autorole',
      group: 'admin',
      aliases: ['defaultrole'],
      description: 'Mettre un role par défaut à ajouter quand un membre rejoinds la guild',
      format: 'RoleID|RoleName(partial or full)',
      examples: ['autorole Member'],
      guildOnly: true,
      args: [
        {
          key: 'role',
          prompt: 'Quel role voulez vous par défaut pour les membres ?',
          type: 'role',
          default: 'delete'
        }
      ],
      clientPermissions: ['MANAGE_ROLES'],
      userPermissions: ['MANAGE_ROLES']
    });
  }

  run (msg, {role}) {
    let description = `🔓 \`${role.name}\` a été définit comme role par défaut sur cette guild et sera attribué aux membres à leur arrivé !`;

    if (role === 'delete') {
      msg.guild.settings.remove('defaultRole');
      description = 'Le role par défaut à été supprimé';
    } else {
      msg.guild.settings.set('defaultRole', role.id);
      description = `Le role \`${role.name}\` sera maintenant ajouté automatiquement aux nouveaux membres !`;
    }

    const embed = new MessageEmbed()
    .setColor(0xcd6e57)
    .setAuthor(msg.author.username, msg.author.displayAvatarURL())
    .setDescription(stripIndents`**Action:** ${description}`)
    .setFooter(msg.guild.name)
    .setTimestamp();

    msg.say(embed).then(message => message.delete({timeout: 2000}))

    return sendLogs(msg, description)
  }
};