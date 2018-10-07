const {Command} = require('discord.js-commando');
const {sendLogs} = require('../../utils.js');

module.exports = class autoroleCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'autorole',
      memberName: 'autorole',
      group: 'moderation',
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
    }

    return sendLogs(msg, description)
  }
};