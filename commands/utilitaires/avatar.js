const {Command} = require('discord.js-commando');
const {MessageEmbed} = require('discord.js');
const {deleteCommandMessages} = require('../../utils.js');

module.exports = class AvatarCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'avatar',
      memberName: 'avatar',
      group: 'utilitaires',
      aliases: ['image'],
      description: 'Récupérer l\'avatar d\'un membre',
      examples: ['avatar DraftMan 256'],
      guildOnly: true,
      args: [
        {
          key: 'member',
          prompt: 'De quel utilisateur voulez-vous l\'avatar?',
          type: 'member'
        },
        {
          key: 'size',
          prompt: 'Quelle taille voulez-vous pour l\'avatar? (Valid sizes: 128, 256, 512, 1024, 2048)',
          type: 'integer',
          default: 1024,
          validate: (size) => {
            const sizes = ['128', '256', '512', '1024', '2048'];

            if (sizes.includes(size)) {
              return true;
            }

            return `La taille ne peut être que ${sizes.map(val => `\`${val}\``).join(', ')}`;
          }
        }
      ]
    });
  }

  run (msg, {member, size}) {
    deleteCommandMessages(msg);
    const avatar = member.user.displayAvatarURL({size});
    
    const ext = avatar.substring(avatar.length - 14, avatar.length - 8);

    const embed = new MessageEmbed()
    .setColor(0xcd6e57)
    .setImage(ext.includes('gif') ? `${avatar}&f=.gif` : avatar)
    .setTitle(member.displayName)
    .setURL(avatar)
    .setDescription(`[Lien direct](${avatar})`);

    return msg.embed(embed);
  }
};