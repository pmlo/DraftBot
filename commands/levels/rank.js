const {Command} = require('discord.js-commando')
const {getUserXp,levelImage,deleteCommandMessages} = require('../../utils.js');

module.exports = class PrefixCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'rank',
			memberName: 'rank',
			group: 'levels',
			aliases: ['level','my-level','my-levels','my-xp'],
			description: 'Afficher votre niveau ou celui d\'un membre du serveur.',
			examples: ['rank', 'rank DraftMan'],
			guildOnly: true,
			args: [{
				key: 'member',
				prompt: 'Quel membre visez vous ?',
				type: 'member',
				default: ''
			}]
		});
	}

	async run(msg, args) {
		deleteCommandMessages(msg);
		if(msg.guild.settings.get('levelSystem') === false) return msg.reply('Impossible d\'afficher les niveaux, ils ont été désactivés sur ce serveur.')
		const user = args.member !== '' ? args.member.user : msg.author;
		getUserXp(msg,user).then(({xp,users}) => {
			const exp = xp === undefined ? 0 : xp.xp
			const place = users.map(u => u.user).indexOf(user.id)+1;
			levelImage(msg,user,exp,place)
		})
	}
};
