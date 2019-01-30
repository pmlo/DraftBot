const {Command} = require('discord.js-commando');
const {MessageEmbed} = require('discord.js');
const {deleteCommandMessages} = require('../../utils.js');

module.exports = class ReactRoleCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'role-msg',
      memberName: 'role-msg',
      group: 'interaction',
      aliases: ['react-msg'],
      description: 'Créer un message avec des réactions permettant aux membres de s\'auto-attribuer des roles',
      examples: ['role-msg Rôles du serveur'],
      guildOnly: true,
      args: [
        {
            key: 'titre',
            prompt: 'Quel titre voulez vous ?',
            type: 'string'
        }
      ]
    });
  }

  async run (msg, {titre}) {
    deleteCommandMessages(msg);

    if(titre.length > 256){
      return msg.reply(`Le titre ne peux pas être plus grand que 256 caractères, il fait actuellement \`${title.length}\` !`)
    }

    const embed = new MessageEmbed()
    .setColor(0xcd6e57)
    .setTitle(titre)
    .setFooter(`Choisissez vos roles en interagissant avec les réactions !`)

    const focus = await msg.channel.send('',embed)
    
    const help = new MessageEmbed()
      .setColor(0xcd6e57)
      .setAuthor(msg.author.username, msg.author.displayAvatarURL())
      .setDescription(`**Astuce:** Pour ajouter des roles \`${msg.guild.commandPrefix}role-react ${focus.id} <role> <emoji>\``)
      .setTimestamp();

    msg.embed(help).then(actionMessage => actionMessage ? actionMessage.delete({timeout: 8000}): null)
  }
};