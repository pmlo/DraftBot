const {Command} = require('discord.js-commando');
const {sendLogsBot,deleteCommandMessages} = require('../../utils.js');

module.exports = class autoroleCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'autorole',
      memberName: 'autorole',
      group: 'configuration',
      aliases: ['defaultrole'],
      description: 'Mettre un rôle par défaut à ajouter quand un nouveau membre rejoint la guilde',
      format: 'RoleID|RoleName(partial or full)',
      examples: ['autorole Member','autorole delete'],
      guildOnly: true,
      args: [
        {
          key: 'role',
          prompt: 'Quel rôle voulez-vous par défaut pour les membres ?',
          type: 'role',
          default: 'no'
        }
      ],
      clientPermissions: ['MANAGE_ROLES'],
      userPermissions: ['MANAGE_ROLES']
    });
  }

  run (msg, {role}) {
    deleteCommandMessages(msg)
    let description;

    if(role == 'no'){
      if(msg.guild.settings.get('defaultRole')){
        description = `🔓 Le rôle attribué aux nouveaux membres est \`${msg.guild.roles.find(r => msg.guild.settings.get('defaultRole') === r.id).name}\` !`;
      }else{
        description = `🔓 Il n'y a aucun rôle attribué automatiquement aux nouveaux membres !`;
      }
    } else if (role.id === msg.guild.settings.get('defaultRole')){
      msg.guild.settings.remove('defaultRole');
      description = `Le rôle \`${role.name}\` qui était attribué automatiquement aux nouveaux membres est maintenant supprimé`;
    } else {
      msg.guild.settings.set('defaultRole', role.id);
      description = `Le rôle \`${role.name}\` sera maintenant attribué automatiquement aux nouveaux membres !`;
    }
    return sendLogsBot(msg, description)
  }
};