const Jimp = require('jimp'),
      path = require('path'),
      {MessageEmbed,MessageAttachment} = require('discord.js')

const makeWelcomeImage = async (member) => {
    try {
      const avatar = await Jimp.read(member.user.displayAvatarURL({format: 'png'})),
        canvas = await Jimp.read(500, 150),
        newMemberEmbed = new MessageEmbed(),
        quantify = await Jimp.loadFont(path.join(__dirname, './fonts/Quantify.fnt')),
        quantify_small = await Jimp.loadFont(path.join(__dirname, './fonts/Quantify2.fnt')),
        opensans = await Jimp.loadFont(path.join(__dirname, './fonts/OpenSans.fnt')),
        mask = await Jimp.read('https://www.draftman.fr/uploads/files/1535393097231.png');
    
      avatar.resize(136, Jimp.AUTO);
      mask.resize(136, Jimp.AUTO);
      avatar.mask(mask, 0, 0);
      canvas.blit(avatar, 5, 5);
      canvas.print(quantify, 158, 20, 'Bienvenue');
      canvas.print(opensans, 158, 70, 'sur le serveur discord');
      canvas.print(quantify_small, 158, 105, member.guild.name);
    
      const buffer = await canvas.getBufferAsync(Jimp.MIME_PNG),
        embedAttachment = new MessageAttachment(buffer, 'joinimg.png');
    
      newMemberEmbed
        .attachFiles([embedAttachment])
        .setColor('#cd6e57')
        .setTitle('Ho ! Un nouveau membre !')
        .setDescription(`Faites du bruit pour __**${member.displayName}**__ !`)
        .setImage('attachment://joinimg.png');

        return member.guild.channels.find(c => c.name === 'general').send(`🎉  Bienvenue <@${member.id}>  🎉!`, {embed: newMemberEmbed});
    } catch (error) {
      return console.log(error);
    }
  };

const addRole = async (role, member) => {
  if(member.guild.roles.find(r => r.name === 'Membre')){
    member.roles.add(member.guild.roles.find(r => r.name === 'Membre'));
  }
}

module.exports = {
  makeWelcomeImage,
  addRole
};