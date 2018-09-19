const { splitMessage } = require('discord.js'),
	  { Command } = require('discord.js-commando')

module.exports = class HelpCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'help',
			group: 'bot',
			memberName: 'help',
			aliases: ['commands','aide'],
			description: 'Afficher la liste des différentes commandes ou les details à propos d\'une commande en particulier.',
			examples: ['help', 'help quote'],
			guarded: true,
			args: [
				{
					key: 'command',
					prompt: 'Pour quelle commande voulez vous de l\'aide',
					type: 'string',
					default: ''
				}
			]
		});
	}

	async run(msg, args) { // eslint-disable-line complexity
		const groups = this.client.registry.groups;
		const commands = this.client.registry.findCommands(args.command, false, msg);
		const showAll = args.command && args.command.toLowerCase() === 'all';
		if(args.command && !showAll) {
			if(commands.length === 1) {
				let help = `__Commande **${commands[0].name}**:__ ${commands[0].description}
						${commands[0].guildOnly ? ' (Utilisable uniquement sur un serveur)' : ''}
						${commands[0].nsfw ? ' (NSFW)' : ''}\n\n
						**Format:** ${msg.anyUsage(`${commands[0].name}${commands[0].format ? ` ${commands[0].format}` : ''}`)}
				`;
				if(commands[0].aliases.length > 0) help += `\n**Alias:** ${commands[0].aliases.join(', ')}`;
				help += `\n**Groupe:** ${commands[0].group.name}\n(\`${commands[0].groupID}:${commands[0].memberName}\`)`;
				if(commands[0].details) help += `\n**Details:** ${commands[0].details}`;
				if(commands[0].examples) help += `\n**Examples:**\n${commands[0].examples.join('\n')}`;

				const messages = [];
				try {
					messages.push(await msg.direct(help));
					if(msg.channel.type !== 'dm') messages.push(await msg.reply('je vous ai envoyer la liste des commandes en MP !'));
				} catch(err) {
					messages.push(await msg.reply('Impossible de vous envoyer de messages privés, il semberait que vous ayez désactivé les messages privés.'));
				}
				return messages;
			} else if(commands.length > 15) {
				return msg.reply('Plusieurs commandes ont été trouvés. s\'il vous plaît veuillez être plus précis.');
			} else if(commands.length > 1) {
				const list = commands.map(item => `"${(property ? item[property] : item).replace(/ /g, '\xa0')}"`).join(',   ');
				return msg.reply(`Plusieurs commandes ont été trouvés, s'il vous plaît veuillez être plus précis: ${list}`);
			} else {
				return msg.reply(
					`Impossible d'identifier la commande. Veuillez utiliser ${msg.usage(
						null, msg.channel.type === 'dm' ? null : undefined, msg.channel.type === 'dm' ? null : undefined
					)} pour voir la liste de toutes les commandes.`
				);
			}
		} else {
			const messages = [];

			try {
				const body =`${`Pour executer une commande sur  ${msg.guild ? msg.guild.name : 'n\'importe quel serveur'},\n
							veuillez utiliser ${Command.usage('command', msg.guild ? msg.guild.commandPrefix : null, this.client.user)}.\n
							Par exemple, ${Command.usage('quote', msg.guild ? msg.guild.commandPrefix : null, this.client.user)}.`}\n\n
							Utilisez ${this.usage('<commande>', null, null)} pour voir les détails d'une commande.
							Utilisez ${this.usage('all', null, null)} pour voir la liste de **toutes** les commandes disponibles.\n\n
							__**${showAll ? 'Toutes les commandes' : `Commandes disponibles : ${msg.guild || 'MP'}`}**__\n\n
							${(showAll ? groups : groups.filter(grp => grp.commands.some(cmd => cmd.isUsable(msg))))
								.map(grp => `__${grp.name}__\n
									${(showAll ? grp.commands : grp.commands.filter(cmd => cmd.isUsable(msg)))
										.map(cmd => `**${cmd.name}:** ${cmd.description}${cmd.nsfw ? ' (NSFW)' : ''}`).join('\n')
									}
								`).join('\n\n')
							}`;

				if(body.length >= 2000) {
					const splitContent = splitMessage(body);

					for(const part in splitContent) {
						messages.push(await msg.direct('', {
							embed: {
								title: "Help",
								color: 0xcd6e57,
								description: splitContent[part]
							}
						}));
					}
				} else {
					messages.push(await msg.direct('', {
						embed: {
							title: "Help",
							color: 0xcd6e57,
							description: body
						}
					}));
				}

				if(msg.channel.type !== 'dm') messages.push(await msg.reply('je vous ai envoyer la liste des commandes en MP !'));
			} catch(err) {
				messages.push(await msg.reply('Impossible de vous envoyer de messages privés, il semberait que vous ayez désactivé les messages privés.'));
			}
			return messages;
		}
	}
};
