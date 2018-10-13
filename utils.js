const Jimp = require('jimp'),
      path = require('path'),
      {MessageEmbed,MessageAttachment,Util} = require('discord.js')

const makeWelcomeImage = async (member) => {
  if (member.guild.settings.get('welcomeMessage') !== false) {
    const channel = member.guild.settings.get('welcomeChannel') ? member.guild.settings.get('welcomeChannel') : member.guild.channels.find(c => c.name === 'general' || c.name === 'général');
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
        
        return member.guild.channels.find(c => c.id === channel.id).send(`🎉  Bienvenue <@${member.id}>  🎉!`, {embed: newMemberEmbed});
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

const sendLogs = (msg, message) => {
  const embed = new MessageEmbed()
    .setColor(0xcd6e57)
    .setAuthor(msg.author.username, msg.author.displayAvatarURL())
    .setDescription(stripIndents`**Action:** ${message}`)
    .setTimestamp();

  if (msg.guild.settings.get('logsChannel')) {
    const channel = msg.guild.settings.get('logsChannel')
    return channel.send('',embed);
  }
  return msg.embed(embed);
}

const newUser = (member,type) => {
  if (member.guild.settings.get('logsMessage') === true) {
    const channel = member.guild.settings.get('logsChannel') ? member.guild.settings.get('logsChannel').id : null;

      const newMemberEmbed = new MessageEmbed()
      .setTitle(':banana: Nouveau membre')
      .setAuthor(`${member.user.tag} (${member.id})`, member.user.displayAvatarURL({format: 'png'}))
      .setColor(0x39d600)
      .setDescription(user.tag + " est arrivé !")
      .setTimestamp();

      const oldMemberEmbed = new MessageEmbed()
      .setTitle(':wastebasket: Membre parti')
      .setAuthor(`${member.user.tag} (${member.id})`, member.user.displayAvatarURL({format: 'png'}))
      .setColor(0xce0000)
      .setDescription(user.tag + " viens de quitter le serveur !")
      .setTimestamp();

    if (member.guild.settings.get('defaultRole') && member.guild.roles.get(member.guild.settings.get('defaultRole') && type === true)) {
      member.roles.add(member.guild.settings.get('defaultRole'));
      newMemberEmbed.setDescription(`${newMemberEmbed.description}\nLe role ${member.guild.roles.get(member.guild.settings.get('defaultRole')).name} lui à été automatiquement attribué !`);
    }

    if (channel && member.guild.channels.get(channel) && member.guild.channels.get(channel).permissionsFor(this.client.user).has('SEND_MESSAGES')) {
      return member.guild.channels.get(channel).send('', {embed: type === true ? newMemberEmbed : oldMemberEmbed});
    }
  }else if (member.guild.settings.get('defaultRole') && member.guild.roles.get(member.guild.settings.get('defaultRole')) && type === true) {
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
    const name = `${this.member.user.username}`;

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

const findChannel = (val, msg) => {
  const matches = val.match(/^(?:<#)?([0-9]+)>?$/);
  if(matches) return msg.guild.channels.get(matches[1]) || null;
  const search = val.toLowerCase();
  const channels = msg.guild.channels.filter(thing => thing.name.toLowerCase().includes(search));
  if(channels.size === 0) return null;
  if(channels.size === 1) return channels.first();
  const exactChannels = channels.filter(filter => filter.name.toLowerCase() === search);
  if(exactChannels.size === 1) return exactChannels.first();
  return null;
}

module.exports = {
  makeWelcomeImage,
  addRole,
  Song,
  roundNumber,
  error,
  sendLogs,
  newUser,
  findChannel
};
