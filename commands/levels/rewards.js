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
			guildOnly: true,
		});
	}

	async run(msg) {
		getRewards(msg.guild).then(async response => {
			const embed = new MessageEmbed()
			.setTitle("Récompenses")
			.setColor(0xcd6e57)
			.setFooter(msg.guild ? msg.guild.name : '',msg.guild ? msg.guild.iconURL({format: 'png'}) : msg.client.user.avatarURL({format: 'png'}))
			.setTimestamp();

			console.log(response)

			let description = "Il n'y a pas de récompense sur ce serveur !";
			if(response.length > 0){
				description = 'Voici les récompenses sur ce serveur:\n';
				[].forEach.call(response,rec => {
					description += `\n**${msg.guild.roles.get(rec.role).name}** (niveau ${rec.level})`
				});
			}

			embed.setDescription(description)

			await msg.embed(embed)
		})
	}
};
