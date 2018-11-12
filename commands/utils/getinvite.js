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

		

		const newGuild = this.client.guilds.find(g => g.name.toLowerCase().includes(guild.toLowerCase()))

		newGuild.fetchInvites()
		.then(invites => {
			const embed = new MessageEmbed()
			.setTitle(newGuild.name)
			.setThumbnail(newGuild.iconURL({format: 'png'}))
			.setColor(0xcd6e57)
			.setDescription(`Voici une invitation pour rejoindre **${newGuild.name}**\n${invites.map(invite => invite.url).join('\n')}`)
			.setTimestamp()

			msg.embed(embed)
		})
	}
};
