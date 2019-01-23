const {MessageEmbed} = require('discord.js'); 
const {Command} = require('discord.js-commando');
const {deleteCommandMessages} = require('../../utils.js');

module.exports = class InviteCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'invite',
      memberName: 'invite',
      group: 'bot',
      aliases: ['inv', 'link', 'add'],
      description: 'Donne un lien d\'invitation',
      examples: ['invite'],
      guildOnly: false
    });
  }

  run (msg) {
    deleteCommandMessages(msg);
    const inviteEmbed = new MessageEmbed()
      .setTitle('DraftBot by DraftMan')
      .setThumbnail('https://www.draftman.fr/images/avatar.jpg')
      .setURL('https://www.draftman.fr/draftbot/invite')
      .setColor(0xcd6e57)
      .setDescription("Ajoute-moi à ton serveur pour que je puisse t'aider dans les tâches difficiles.\nSi tu souhaites en apprendre plus à mon sujet, DraftMan a réalisé une page en **mon** honneur et vu qu'on est plutôt proches je t'en fais cadeau 😉!\n[draftman.fr/draftbot](https://www.draftman.fr/draftbot)\n\n Pour ce qui est de l'invitation: la voici :\n[draftman.fr/drafbot/invite](https://www.draftman.fr/draftbot/invite)\n\nCordialement __**DraftBot**__\n\nPS: Je t'attends patiemment 😘");


    return msg.embed(inviteEmbed, `Je veux faire partie de ta vie ${msg.author} ❤ !`);
  }
};