const {Command} = require('discord.js-commando');
const {sendLogsBot,deleteCommandMessages} = require('../../utils.js');

module.exports = class CommandMessagesCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'command-messages',
      memberName: 'command-messages',
      group: 'configuration',
      aliases: ['messagecommands','messagecommand','messagescommand','commandmessages','commandsmessages','commandsmessage'],
      description: 'Activer ou désactiver la suppression des messages de commandes.',
      examples: ['welcome'],
      guildOnly: true,
      userPermissions: ['ADMINISTRATOR']
    });
  }

  async run (msg) {
    deleteCommandMessages(msg);
    let description;

    if (msg.guild.settings.get('deletecommandmessages') !== true) {
      msg.guild.settings.set('deletecommandmessages',true);
      description = `🎉 Les messages de commandes seront maintenant **supprimés** !`;
    }else{
      msg.guild.settings.set('deletecommandmessages', false);
      description = `🎉 Les messages de commandes seront maintenant **conservés** !`;
    }

    return sendLogsBot(msg, description)
  }
};