const {Command} = require('discord.js-commando')
const {getUsersXp,getLevelFromXp,deleteCommandMessages} = require('../../utils.js');
const {MessageEmbed} = require('discord.js');

module.exports = class PrefixCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'classement',
			memberName: 'classement',
			group: 'levels',
			aliases: ['classements','ranks','levels'],
			description: 'Afficher la liste des membres les plus actifs !',
			examples: ['classement'],
			guildOnly: true
		});
	}

	async run(msg) {
		deleteCommandMessages(msg);
		if(msg.guild.settings.get('levelSystem') === false) return msg.reply('Impossible d\'afficher les niveaux, ils ont été désactivés sur ce serveur.')

		getUsersXp(msg,msg.author).then(async ({xp,users}) => {
			const embed = new MessageEmbed()
			.setTitle(`Classement de ${msg.guild.name}`)
			.setThumbnail(msg.guild.iconURL({format: 'png'}))
			.setColor(0xcd6e57)
			.setFooter(msg.guild.name,msg.guild.iconURL({format: 'png'}))
			.setTimestamp();

			const exp = xp === undefined ? 0 : xp.xp;
			let userlist = '', xplist = '';
			let place = 0;
			await [].forEach.call(users, user => {
				this.client.users.fetch(user.user).then(u => {
					place++
					userlist += `\n#${place} **${u.username}**   `
					xplist += `\nNiveau ${getLevelFromXp(user.xp)} (${user.xp}xp)`
				})
			})

			const placeU = users.map(u => u.user).indexOf(msg.author.id)+1;
			if(placeU > 5){
				userlist += `\n\n#${placeU} **${msg.author.username}**   `
				xplist += `\n\nNiveau ${getLevelFromXp(exp)} (${exp}xp)`
			}
			embed
			.addField('Utilisateurs',userlist,true)
			.addField('Niveau',xplist,true)

			msg.embed(embed)
		})
	}
};
