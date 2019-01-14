const {Command} = require('discord.js-commando');
const {deleteCommandMessages,sendLogsBot} = require('../../utils.js');

module.exports = class EnableCommandCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'enable',
			aliases: ['enable-command', 'cmd-on', 'command-on','activer','activer-commande'],
			group: 'admin',
			memberName: 'enable',
			description: 'Activer une commande ou un groupe de commandes.',
			examples: ['enable levels', 'enable prefix'],
			guarded: true,
			args: [
				{
					key: 'cmdOrGrp',
					label: 'command/group',
					prompt: 'Quelle commande ou quel groupe souhaitez vous activer ?',
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
		const group = args.cmdOrGrp.group;
		if(args.cmdOrGrp.isEnabledIn(msg.guild, true)) {
			return msg.reply(
				`${args.cmdOrGrp.group ? 'La commande' : 'Le groupe'} \`${args.cmdOrGrp.name}\`  est déjà activé ${
					group && !group.isEnabledIn(msg.guild) ?
					`, mais le groupe \`${group.name}\` est désactivé, donc il ne peut toujours pas être utilisé` :
					''
				}.`
			);
		}
		args.cmdOrGrp.setEnabledIn(msg.guild, true);

		return sendLogsBot(msg, `${group ? 'La commande' : 'Le groupe'} \`${args.cmdOrGrp.name}\` ${group && !group.isEnabledIn(msg.guild) ? `, mais le groupe \`${group.name}\` est désactivé, donc il ne peut toujours pas être utilisé` : ''}.`)
	}
};
