const {MessageEmbed} = require('discord.js');
const {Command} = require('discord.js-commando');
const {deleteCommandMessages} = require('../../utils.js');

module.exports = class InviteCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'suggest',
      memberName: 'suggest',
      group: 'bot',
      aliases: ['suggestion', 'idée', 'feature','new-feature'],
      description: 'Donner une suggestion au bot',
      examples: ['suggest Créer une commande de suggestion'],
      args: [{
				key: 'suggest',
				prompt: 'Quelle suggestion souhaitez vous donner ?',
				type: 'string'
			}]
    });
  }

  run (msg,{suggest}) {
    deleteCommandMessages(msg);
    msg.reply('merci de votre suggestion, elle sera annalisée et si elle est pertinente, vous la vérez très prochainement dans la liste des commandes !')
    const embed = new MessageEmbed()
      .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
      .setColor(0xcd6e57)
      .setDescription(suggest)
      .setFooter(msg.guild ? msg.guild.name : '',msg.guild ? msg.guild.iconURL({format: 'png'}) : msg.client.user.avatarURL({format: 'png'}))
      .setTimestamp()

    return this.client.channels.get('506585964672581632').send(embed)
  }
};