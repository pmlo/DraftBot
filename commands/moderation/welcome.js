const {Command} = require('discord.js-commando'),
{addRole,makeWelcomeImage} = require('../../utils.js')

module.exports = class PurgeCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'welcome',
      memberName: 'welcome',
      group: 'moderation',
      aliases: ['bvn'],
      description: 'Dire bienvenue à un membre',
      examples: ['!welcome DraftMan'],
      guildOnly: true,
      args: [
        {
          key: 'member',
          prompt: 'A quel membre voulez vous souhaiter la bienvenue ?',
          type: 'member'
        }
      ],
      userPermissions: ['ADMINISTRATOR']
    });
  }

  async run (msg, {member}) {

    addRole('Membre',member);
    makeWelcomeImage(member);

    return msg.delete();
  }
};