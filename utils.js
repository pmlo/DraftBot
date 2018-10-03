const Jimp = require('jimp'),
      path = require('path'),
      {MessageEmbed,MessageAttachment,Util} = require('discord.js')

const makeWelcomeImage = async (member) => {
  if (member.guild.settings.get('welcomeMessage') !== false) {
    try {
      const avatar = await Jimp.read(member.user.displayAvatarURL({format: 'png'})),
        canvas = await Jimp.read(500, 150),
        newMemberEmbed = new MessageEmbed(),
        quantify = await Jimp.loadFont(path.join(__dirname, './fonts/Quantify.fnt')),
        quantify_small = await Jimp.loadFont(path.join(__dirname, './fonts/Quantify2.fnt')),
        opensans = await Jimp.loadFont(path.join(__dirname, './fonts/OpenSans.fnt')),
        mask = await Jimp.read('https://www.draftman.fr/images/mask.png');
    
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

        return member.guild.channels.find(c => c.name === 'general' || c.name === 'général').send(`🎉  Bienvenue <@${member.id}>  🎉!`, {embed: newMemberEmbed});
    } catch (error) {
      return console.log(error);
    }
  }
};

const addRole = (role, member) => {
  if(member.guild.roles.find(r => r.name === role)){
    member.roles.add(member.guild.roles.find(r => r.name === role));
  }
}

const addDefaultRole = member => {
  if (member.guild.settings.get('defaultRole') && member.guild.roles.get(member.guild.settings.get('defaultRole'))){
    member.roles.add(member.guild.settings.get('defaultRole'));
  }
}

const error = (message) => {
  return `:no_entry_sign: | ${message}`
}

class Song {
  constructor (video, member) {
    this.name = Util.escapeMarkdown(video.title);
    this.id = video.id;
    this.length = video.durationSeconds ? video.durationSeconds : video.duration / 1000;
    this.member = member;
    this.dispatcher = null;
    this.playing = false;
  }

  get url () {
    return `https://www.youtube.com/watch?v=${this.id}`;
  }

  get thumbnail () {
    const thumbnail = `https://img.youtube.com/vi/${this.id}/mqdefault.jpg`;

    return thumbnail;
  }

  get username () {
    const name = `${this.member.user.tag} (${this.member.user.id})`;

    return Util.escapeMarkdown(name);
  }

  get avatar () {
    const avatar = `${this.member.user.displayAvatarURL({format: 'png'})}`;

    return avatar;
  }

  get lengthString () {
    return this.constructor.timeString(this.length);
  }

  timeLeft (currentTime) {
    return this.constructor.timeString(this.length - currentTime);
  }

  toString () {
    return `${this.name} (${this.lengthString})`;
  }

  static timeString (seconds, forceHours = false) {
    const hours = Math.floor(seconds / 3600),
          minutes = Math.floor(seconds % 3600 / 60);

    return `${forceHours || hours >= 1 ? `${hours}:` : ''}${hours >= 1 ? `0${minutes}`.slice(-2) : minutes}:${`0${Math.floor(seconds % 60)}`.slice(-2)}`;
  }
}

const roundNumber = function (num, scale = 0) {
  if (!String(num).includes('e')) {
    return Number(`${Math.round(`${num}e+${scale}`)}e-${scale}`);
  }
  const arr = `${num}`.split('e');
  let sig = '';

  if (Number(arr[1]) + scale > 0) {
    sig = '+';
  }

  return Number(`${Math.round(`${Number(arr[0])}e${sig}${Number(arr[1]) + scale}`)}e-${scale}`);
};

module.exports = {
  makeWelcomeImage,
  addRole,
  addDefaultRole,
  Song,
  roundNumber,
  error
};
