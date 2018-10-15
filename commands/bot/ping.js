const {Command} = require('discord.js-commando')

module.exports = class PingCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'ping',
			memberName: 'ping',
			group: 'bot',
			aliases: ['connexion','pong'],
			description: 'Vérifier le ping du bot sur le serveur Discord.',
			examples: ['ping'],
		});
	}

	async run(msg) {
		if(!msg.editable) {
			const pingMsg = await msg.reply('Pinging...');
			return pingMsg.edit(`${msg.channel.type !== 'dm' ? `${msg.author}, ` : ''}Pong! Le retour du message a pris ${pingMsg.createdTimestamp - msg.createdTimestamp}ms.\n${this.client.ping ? `Le ping est de ${Math.round(this.client.ping)}ms.` : ''}`);
		} else {
			await msg.edit('Pinging...');
			return msg.edit(`Pong! Le retour du message a pris ${msg.editedTimestamp - msg.createdTimestamp}ms.\n${this.client.ping ? `Le ping est de ${Math.round(this.client.ping)}ms.` : ''}`);
		}
	}
};
