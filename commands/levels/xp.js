const {Command} = require('discord.js-commando')
const {removeUserXp,addUserXp,levelImage,getUserXp} = require('../../utils.js');

module.exports = class PrefixCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'xp',
			memberName: 'xp',
			group: 'levels',
			aliases: ['change-xp'],
			description: 'Faire des modifications sur le nombre d\'xp d\'un membre',
			examples: ['xp ajouter DraftMan 3000'],
			args: [{
				key: 'argument',
				prompt: 'Que souhaitez vous faire ? `ajouter`,`add`/`enlever`,`retirer`,`remove`',
				type: 'string',
				validate: v => (/(ajouter|add|enlever|retirer|remove)/i).test(v) ? true : 'doit être une valeur valide, `ajouter`,`add`/`enlever`,`retirer`,`remove`',
				parse: pf => pf.toLowerCase()
			},
			{
				key: 'member',
				prompt: 'Que utilisateur est votre cible ?',
				type: 'member'
			},
			{
				key: 'nombre',
				prompt: 'Quel chiffre choisissez vous ?',
				type: 'integer',
				min: 1
			}],
			userPermissions: ['ADMINISTRATOR']
		});
	}

	async run(msg, {argument,member,nombre}) {
		if(msg.guild.settings.get('levelSystem') === false) return msg.reply('impossible de modifier l\'xp d\'un membre, les levels ont été désactivés sur ce serveur.')
		if(argument === 'add' || argument === 'ajouter'){
			addUserXp(msg,member.user,nombre).then(response => {
				console.log(response)
				if(response) msg.reply(`${nombre} xp ont été ajoutés au compte de ${member.user} !`)
			})
		}else if(argument === 'remove' || argument === 'enlever' || argument === 'retirer'){
			removeUserXp(msg,member.user,nombre).then(response => {
				console.log(response)
				if(response) msg.reply(`${nombre} xp ont été retirés au compte de ${member.user} !`)
			})
		}
		getUserXp(msg,member.user).then(({xp,users}) => {
			const exp = xp === undefined ? 0 : xp.xp
			const place = users.map(u => u.user).indexOf(user.id)+1;
			levelImage(msg,user,exp,place)
		})
	}
};
