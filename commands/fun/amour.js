const {Command} = require('discord.js-commando')
const Jimp = require('jimp');
const path = require('path');
const { MessageAttachment, MessageEmbed } = require('discord.js');
const {roundNumber} = require('../../utils.js')
const { oneLine } = require('common-tags');

module.exports = class AmourCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'amour',
			memberName: 'amour',
			group: 'fun',
			aliases: ['amours'],
			description: 'Trouver un l\'amour parfait',
			examples: ['amour'],
			args: [
				{
				  key: 'romeo',
				  prompt: 'Qui choisir ?',
				  type: 'member',
				  default: 'random',
				},
				{
				  key: 'juliette',
				  prompt: 'Qui choisir d\'autre ?',
				  type: 'member',
				  default: 'random',
				}
			]
		});
	}

	async run(msg, {romeo, juliette}) {
		romeo = romeo !== 'random' ? romeo.user : msg.guild.members.random().user;
		juliette = juliette !== 'random' ? juliette.user : msg.guild.members.random().user;

		const avaOne = await Jimp.read(romeo.displayAvatarURL({ format: 'png' }));
		const avaTwo = await Jimp.read(juliette.displayAvatarURL({ format: 'png' }));
		const canvas = await Jimp.read(384, 128);
		const heart = await Jimp.read(path.join(__dirname, '../../images/heart.png'));
		const randLengthRomeo = roundNumber((Math.random() * 4) + 2);
		const randLengthJuliette = roundNumber((Math.random() * 4) + 2);

		avaOne.resize(128, Jimp.AUTO);
		avaTwo.resize(128, Jimp.AUTO);

		canvas.blit(avaOne, 0, 0);
		canvas.blit(avaTwo, 256, 0);
		canvas.blit(heart, 160, 32);

		const buffer = await canvas.getBufferAsync(Jimp.MIME_PNG);
		const embedAttachment = new MessageAttachment(buffer, 'amour.png');

		const embed = new MessageEmbed()
		.attachFiles([ embedAttachment ])
		.setColor(0xcd6e57)
		.setTitle(`Amour entre ${romeo.username} et ${juliette.username}`)
		.setDescription(oneLine`Il s'appelera...
				${romeo.username.substring(0, roundNumber(romeo.username.length / randLengthRomeo))}${juliette.username.substring(roundNumber(juliette.username.length / randLengthJuliette))}! 😘`)
		.setImage('attachment://amour.png');

		return msg.embed(embed);
	}
};
