const { Command } = require('discord.js-commando')
const { MessageEmbed } = require('discord.js')

module.exports = class InviteCommandCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'getinvite',
			group: 'utils',
			memberName: 'getinvite',
			description: 'Get a invite.',
			ownerOnly: true,
			args: [{
				key: 'guild',
				prompt: 'Quelle guild vous interesse?',
				type: 'string'
			}]
		});
	}

	run(msg, { guild }) {

		

		const newGuild = this.client.guilds.find(g => g.name.toLowerCase() === guild.toLowerCase())

		newGuild.fetchInvites()
		.then(invites => {
			const embed = new MessageEmbed()
			.setTitle(newGuild.name)
			.setThumbnail(newGuild.iconURL({format: 'png'}))
			.setURL(invites[0].url)
			.setColor(0xcd6e57)
			.setDescription(`Voici une invitation pour rejoindre **${newGuild.name}**\n${invites[0].url}`)
			.setTimestamp()

			msg.embed(embed)
		})
	}
};
