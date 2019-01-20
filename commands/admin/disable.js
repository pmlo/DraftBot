const {Command} = require('discord.js-commando');
const {deleteCommandMessages,sendLogsBot} = require('../../utils.js');

module.exports = class DisableCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'disable',
			aliases: ['disable-command', 'cmd-off', 'command-off','désactiver','desactiver','desactiver-commande'],
			group: 'admin',
			memberName: 'disable',
			description: 'Désactiver une commande ou un groupe de commandes.',
			examples: ['disable levels', 'disable prefix'],
			guarded: true,
			args: [
				{
					key: 'cmdOrGrp',
					label: 'command/group',
					prompt: 'Quelle commande ou quel groupe souhaitez vous désactiver ?',
					type: 'group|command'
				}
			]
		});
	}

	hasPermission(msg) {
		if(!msg.guild) return this.client.isOwner(msg.author);
		return msg.member.hasPermission('ADMINISTRATOR') || this.client.isOwner(msg.author);
	}

	run(msg, args) {
		deleteCommandMessages(msg)
		if(!args.cmdOrGrp.isEnabledIn(msg.guild, true)) {
			return msg.reply(`${args.cmdOrGrp.group ? 'La commande' : 'Le groupe'} \`${args.cmdOrGrp.name}\` est déjà désactivé.`);
		}
		if(args.cmdOrGrp.guarded) {
			return msg.reply(`Vous ne pouvez pas désactiver ${args.cmdOrGrp.group ? 'la commande' : 'le groupe'} \`${args.cmdOrGrp.name}\`.`);
		}
		args.cmdOrGrp.setEnabledIn(msg.guild, false);
	
		return sendLogsBot(msg, `${args.cmdOrGrp.group ? 'La commande' : 'Le groupe'} \`${args.cmdOrGrp.name}\`est maintenant désactivé.`)
	}
};
