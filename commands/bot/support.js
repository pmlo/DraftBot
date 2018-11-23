const {MessageEmbed} = require('discord.js'), 
  {Command} = require('discord.js-commando')

module.exports = class InviteCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'support',
      memberName: 'support',
      group: 'bot',
      aliases: ['probleme', 'erreur','aide'],
      description: 'Recevoir une invitation pour rejoindre le support',
      examples: ['support'],
      guildOnly: false
    });
  }

  run (msg) {
    const supportEmbed = new MessageEmbed()
      .setTitle('Support du DraftBot')
      .setThumbnail('https://www.draftman.fr/images/avatar.jpg')
      .setURL('https://discord.gg/G3Pc4Sa')
      .setColor(0xcd6e57)
      .setDescription("C'est tout à fait normal d'avoir un soucis ça peut arriver à tout le monde, surtout quand vous n'êtes pas propriétaire du robot 😉 !\n\nVoici une invitation vers [mon support](https://discord.gg/G3Pc4Sa) !\n\nCordialement __**DraftBot**__\n\nPS: Je crois que DraftMan t'attends patiemment 😘");

    return msg.embed(supportEmbed);
  }
};