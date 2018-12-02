const {Command} = require('discord.js-commando')
const {getRewards} = require('../../utils.js');
const {MessageEmbed} = require('discord.js');

module.exports = class PrefixCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'rewards',
			memberName: 'rewards',
			group: 'levels',
			aliases: ['recompense','recompenses','récompense','récompenses','rewards'],
			description: 'Faire des modifications sur le nombre d\'xp d\'un membre',
			examples: ['rewards'],
		});
	}

	async run(msg) {
		getRewards(msg.guild).then(response => {
			const embed = new MessageEmbed()
			.setTitle("Récompenses")
			.setDescription("Voici les récompenses sur ce serveur")
			.setColor(0xcd6e57)
			.setFooter(msg.guild ? msg.guild.name : '',msg.guild ? msg.guild.iconURL({format: 'png'}) : msg.client.user.avatarURL({format: 'png'}))
			.setTimestamp();

			console.log(response);

			[].forEach.call(response,rec => {
				embed.addField(`Niveau ${rec.level}`, `Role ${msg.guild.roles.get(rec.role).name}`)
			});

			msg.embed(embed)
		})
	}
};
