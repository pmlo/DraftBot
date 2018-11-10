const {Command} = require('discord.js-commando');
const {sendLogs} = require('../../utils.js');

module.exports = class autoroleCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'autorole',
      memberName: 'autorole',
      group: 'admin',
      aliases: ['defaultrole'],
      description: 'Mettre un role par défaut à ajouter quand un membre rejoint la guild',
      format: 'RoleID|RoleName(partial or full)',
      examples: ['autorole Member','autorole delete'],
      guildOnly: true,
      args: [
        {
          key: 'role',
          prompt: 'Quel role voulez vous par défaut pour les membres ?',
          type: 'role'
        }
      ],
      clientPermissions: ['MANAGE_ROLES'],
      userPermissions: ['MANAGE_ROLES']
    });
  }

  run (msg, {role}) {
    let description;

    if(!role){
      if(msg.guild.settings.get('defaultRole')){
        description = `🔓 Le role attribué aux nouveaux membres est \`${role.name}\` !`;
      }else{
        description = `🔓 Il n'y a aucun role attribué automatiquement aux nouveaux membres !`;
      }
    }else if (role === 'delete') {
      msg.guild.settings.remove('defaultRole');
      description = 'Le role par défaut à été supprimé';
    } else {
      msg.guild.settings.set('defaultRole', role.id);
      description = `Le role \`${role.name}\` sera maintenant ajouté automatiquement aux nouveaux membres !`;
    }
    return sendLogs(msg, description)
  }
};