const {Command} = require('discord.js-commando')

module.exports = class PrefixCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'prefix',
			memberName: 'prefix',
			group: 'bot',
			description: 'Afficher ou changer le prefix.',
			format: '[prefix/"default"/"none"]',
			examples: ['prefix', 'prefix ?', 'prefix @', 'prefix default', 'prefix none'],
			args: [{
				key: 'prefix',
				prompt: 'Quel prefix voulez vous pour le bot',
				type: 'string',
				max: 15,
				default: ''
			}]
		});
	}

	async run(msg, args) {
		if(!args.prefix) {
			const prefix = msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix;
			return msg.reply(`${prefix ? `Le prefix des commandes est \`\`${prefix}\`\`.` : 'Il n\'y a aucun prefix.'}\nA partir de maintenant, veuillez utilisez ${msg.anyUsage('commande')} pour executer une commande.`);
		}

		if(msg.guild) {
			if(!msg.member.hasPermission('ADMINISTRATOR') && !this.client.isOwner(msg.author)) {
				return msg.reply('Uniquement les Administateurs peuvent changer le prefix du bot');
			}
		} else if(!this.client.isOwner(msg.author)) {
			return msg.reply('Seul le propriétaire du bot peut modifier le prefix global.');
		}

		const lowercase = args.prefix.toLowerCase();
		const prefix = lowercase === 'none' ? '' : args.prefix;
		let response;
		if(lowercase === 'default') {
			if(msg.guild) msg.guild.commandPrefix = null; else this.client.commandPrefix = null;
			const current = this.client.commandPrefix ? `\`\`${this.client.commandPrefix}\`\`` : 'aucun prefix';
			response = `Réinitialisation du prefix commande  (actuellement ${current}).`;
		} else {
			if(msg.guild) msg.guild.commandPrefix = prefix; else this.client.commandPrefix = prefix;
			response = prefix ? `Prefix de commande définit sur \`\`${args.prefix}\`\`.` : 'Suppression du prefix de commande.';
		}

		await msg.reply(`${response} \nA partir de maintenant, veuillez utilisez ${msg.anyUsage('commande')} pour executer une commande.`);
		return null;
	}
};
