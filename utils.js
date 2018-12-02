const Jimp = require('jimp');
const path = require('path');
const pixelWidth = require('string-pixel-width');
const { stripIndents } = require('common-tags')
const {MessageEmbed,MessageAttachment,Util} = require('discord.js');
const Database = require('better-sqlite3');

const levelImage = async (msg,user,xp,place) => {
  try {
    const canvas = new Jimp(500,150,'#2E3133');

    // Datas
    const level = getLevelFromXp(xp)

    const levelXp = getLevelXp(level)
    const currentLevelXp = getCurrentLevelXp(xp)

    const pr = Math.round(currentLevelXp*330/levelXp);

    // Elements
    const barreBackground = await Jimp.read(path.join(__dirname, './images/barreBackground.png'));
    const avatar = await Jimp.read(user.displayAvatarURL({format: 'png'}));
    const barre = await Jimp.read(pr,17,'#cd6e57');

    // Masks
    const avatarMask = await Jimp.read(path.join(__dirname, './images/avatarMask.png'));
    const levelMask = await Jimp.read(path.join(__dirname, './images/levelMask.png'));

    // Fonts
    const Quantify_26_draft = await Jimp.loadFont(path.join(__dirname, './fonts/Quantify_26_draft.fnt'));
    const Quantify_16_draft = await Jimp.loadFont(path.join(__dirname, './fonts/Quantify_16_draft.fnt'));
    const Quantify_16_grey = await Jimp.loadFont(path.join(__dirname, './fonts/Quantify_16_grey.fnt'));
    const Quantify_14_draft = await Jimp.loadFont(path.join(__dirname, './fonts/Quantify_14_draft.fnt'));
    const Quantify_14_grey = await Jimp.loadFont(path.join(__dirname, './fonts/Quantify_14_grey.fnt'));

    // Stats
    const discriminatorPlace = Number(158) + Number(pixelWidth(user.username.sansAccents(), { font: 'Quantify', size: 26 }));
    const levelPlace = Number(500) - (Number(30) + Number(pixelWidth(`Niveau ${level}`, { font: 'Quantify', size: 16 })));
    const placePlace = levelPlace - (Number(30) + Number(pixelWidth(`Place ${place}`, { font: 'Quantify', size: 16 })));
    const rxpPlace = Number(500) - (Number(30) + Number(pixelWidth(`/${levelXp}xp`, { font: 'Quantify', size: 14 })));
    const xpPlace = rxpPlace - Number(pixelWidth(currentLevelXp, { font: 'Quantify', size: 14 }));

    //Generated Elements
    avatar.resize(110, Jimp.AUTO);
    avatar.mask(avatarMask, 0, 0);

    barre.mask(levelMask, 0, 0);

    // Composites
    canvas.composite(barreBackground, 150,90);
    canvas.composite(barre, 150,90);
    canvas.composite(avatar, 20, 20);

    //Generated Texts
    canvas.print(Quantify_26_draft, 158, 53, user.username.sansAccents());
    canvas.print(Quantify_16_draft, levelPlace, 111, `Niveau ${level}`);
    canvas.print(Quantify_16_grey, discriminatorPlace, 61, `#${user.discriminator}`);
    canvas.print(Quantify_16_grey, placePlace, 111, `Place ${place}`);

    canvas.print(Quantify_14_grey, rxpPlace, 63,  `/${levelXp}xp`);
    canvas.print(Quantify_14_draft, xpPlace, 63, `${currentLevelXp}`);

    // Embed
    const buffer = await canvas.getBufferAsync(Jimp.MIME_PNG);
    const embedAttachment = new MessageAttachment(buffer, 'testImage.png');

    const newMemberEmbed = new MessageEmbed()
    .attachFiles([embedAttachment])
    .setColor(0xcd6e57)
    .setImage('attachment://testImage.png');

    return msg.embed(newMemberEmbed)

  } catch (error) {
    return console.log(error);
  }
}

const makeWelcomeImage = async (member) => {
  if (member.guild.settings.get('welcomeMessage') !== false && !member.user.bot) {
    let channel = member.guild.settings.get('welcomeChannel') ? member.guild.settings.get('welcomeChannel') : member.guild.channels.find(c => c.name === 'general' || c.name === 'général');
      if(channel === undefined) channel = member.guild.systemChannel
      try {

        const canvas = new Jimp(500, 150);
        const avatar = await Jimp.read(member.user.displayAvatarURL({format: 'png'}));

        const Quantify_55_white = await Jimp.loadFont(path.join(__dirname, './fonts/Quantify_55_white.fnt'));
        const Quantify_25_white = await Jimp.loadFont(path.join(__dirname, './fonts/Quantify_25_white.fnt'));
        const OpenSans_22_white = await Jimp.loadFont(path.join(__dirname, './fonts/OpenSans_22_white.fnt'));
        const mask = await Jimp.read('https://www.draftman.fr/images/mask.png');

        avatar.resize(136, Jimp.AUTO);
        mask.resize(136, Jimp.AUTO);
        avatar.mask(mask, 0, 0);

        canvas.blit(avatar, 5, 5);

        canvas.print(Quantify_55_white, 158, 20, 'Bienvenue');
        canvas.print(OpenSans_22_white, 158, 70, 'sur le serveur discord');
        canvas.print(Quantify_25_white, 158, 105, member.guild.name);

        const buffer = await canvas.getBufferAsync(Jimp.MIME_PNG);
        const embedAttachment = new MessageAttachment(buffer, 'joinimg.png');

        const newMemberEmbed = new MessageEmbed()
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

const guildAdd = async guild => {
  try {
    const channel = guild.systemChannel ? guild.systemChannel : null;
    const newGuildEmbed = new MessageEmbed()
    .setColor(0xcd6e57)
    .setTitle('Plop 👋')
    .setDescription(stripIndents`
    Hey, Je m'appelle ${guild.client.user}.
    Je suis un bot polyvalent français, j'espère pouvoir améliorer votre serveur!

    Je possède de nombreuses commandes, elles sont toutes visibles avec \`${guild.client.commandPrefix}help\`.

    Vous n'apréciez pas mon prefix ? \`${guild.client.commandPrefix}prefix [nouveau prefix]\`
    Toutes mes commandes peuvent être lancés à partir de mon prefix \`${guild.client.commandPrefix}\` ou par mention \`@${guild.client.user.tag}\`

    **Pour répondre au mieux à vos besoins vous pouvez me configurer facielement avec: \`${guild.client.commandPrefix}init\`**
    `)

    return channel ? channel.send('', {embed: newGuildEmbed}) : null;
  } catch (err) {
    console.log(err);
    return null;
  }
};

const addRole = (role, member) => {
  if(member.guild.roles.find(r => r.name === role)){
    member.roles.add(member.guild.roles.find(r => r.name === role));
  }
}

const sendLogsBot = (msg, message) => {
  const embed = new MessageEmbed()
    .setColor(0xcd6e57)
    .setAuthor(msg.author.username, msg.author.displayAvatarURL())
    .setDescription(stripIndents`**Action:** ${message}`)
    .setFooter(`Logs du serveur ${msg.guild.name}`)
    .setTimestamp();

  msg.embed(embed).then(msg => msg.delete({timeout: 2000}))

  if (msg.guild.settings.get('logsMessageBot') === true) {
      const channel = msg.guild.settings.get('logsChannel') ? msg.guild.settings.get('logsChannel') : msg.guild.channels.find(c => c.name === 'logs');
      if(channel !== undefined){
        msg.guild.channels.find(c => c.id === channel.id).send('',embed)
        return;
      }
    return msg.reply(error('impossible de trouver de channel de logs !'))
  }
}

const sendLogsServ = (guild,title, message) => {
  const embed = new MessageEmbed()
    .setColor(0xcd6e57)
    .setTimestamp()
    .setFooter(`Logs du serveur ${guild.name}`);

  if(title !== null) embed.setTitle(title)
  if(message !== null) embed.setDescription(message)

  if (guild.settings.get('logsMessageServ') === true) {
      const channel = guild.settings.get('logsChannel') ? guild.settings.get('logsChannel') : guild.channels.find(c => c.name === 'logs');
      if(channel !== undefined){
        guild.channels.find(c => c.id === channel.id).send('',embed)
        return;
      }
    return guild.systemChannel.send(error('impossible de trouver de channel de logs !'))
  }
}

const newUser = (member,type) => {
  if (member.guild.settings.get('logsMessageBot') === true) {
    const channel = member.guild.settings.get('logsChannel') ? member.guild.settings.get('logsChannel').id : null;

      const newMemberEmbed = new MessageEmbed()
      .setAuthor(member.user.tag, member.user.displayAvatarURL({format: 'png'}))
      .setColor(0x39d600)
      .setDescription(member.user.tag + " est arrivé !")
      .setTimestamp();

      const oldMemberEmbed = new MessageEmbed()
      .setAuthor(member.user.tag, member.user.displayAvatarURL({format: 'png'}))
      .setColor(0xce0000)
      .setDescription(member.user.tag + " viens de quitter le serveur !")
      .setTimestamp();

    if (member.guild.settings.get('defaultRole') && member.guild.roles.get(member.guild.settings.get('defaultRole')) && type === true) {
      member.roles.add(member.guild.settings.get('defaultRole'));
      newMemberEmbed.setDescription(`${newMemberEmbed.description}\nLe role ${member.guild.roles.get(member.guild.settings.get('defaultRole')).name} lui à été automatiquement attribué !`);
    }

    if (channel && member.guild.channels.get(channel) && member.guild.channels.get(channel).permissionsFor(member.guild.client.user).has('SEND_MESSAGES')) {
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

const roundNumber = (num, scale = 0) => {
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

const findChannel = (val, msg) => new Promise((resolve, reject) =>{
  const matches = val.match(/^(?:<#)?([0-9]+)>?$/);
  if(matches) resolve({channel: msg.guild.channels.get(matches[1]) || null})
  const search = val.toLowerCase();
  const channels = msg.guild.channels.filter(thing => thing.name.toLowerCase().includes(search) && thing.type === 'text');
  if(channels.size === 0) return reject();
  if(channels.size >= 1) return resolve({channel: channels.first()})
  const exactChannels = channels.filter(filter => filter.name.toLowerCase() === search);
  if(exactChannels.size === 1) return resolve({channel: exactChannels.first()});
  return reject();
})

const findRole = (val, msg) => new Promise((resolve, reject) =>{
  const matches = val.match(/^(?:<@&)?([0-9]+)>?$/);
  if(matches) return resolve({role: msg.guild.roles.get(matches[1]) || null});
  const search = val.toLowerCase();
  const roles = msg.guild.roles.filter(thing => thing.name.toLowerCase().includes(search));
  if(roles.size === 0) return reject();
  if(roles.size >= 1) return resolve({role: roles.first()});
  const exactRoles = roles.filter(thing => thing.name.toLowerCase() === search);
  if(exactRoles.size === 1) return resolve({role: exactRoles.first()});
  return reject();
});

const invites = function (msg, client) {
  if (msg.author.bot || client.isOwner(msg.author) || msg.member.hasPermission('MANAGE_MESSAGES')) {
    return false;
  }
  if ((/(?:discord\.gg|discordapp.com\/invite)/gim).test(msg.content)) {
    return true;
  }
  return false;
};

const createTables = () => {
  const db = new Database(path.join(__dirname, './storage.sqlite'));
  db.prepare(`CREATE TABLE IF NOT EXISTS "warnings"(guild TEXT, user TEXT, reason TEXT NOT NULL, date DATE, mod TEXT)`).run()
  db.prepare(`CREATE TABLE IF NOT EXISTS "levels"(guild TEXT, user TEXT, xp INTEGER)`).run()
  db.prepare(`CREATE TABLE IF NOT EXISTS "reacts"(guild TEXT, message TEXT, emoji TEXT, role TEXT)`).run()
  db.prepare(`CREATE TABLE IF NOT EXISTS "rewards"(guild TEXT, level INTEGER, role TEXT, date DATE)`).run()
}
const warnUser = (msg,member,reason) => {
  const db = new Database(path.join(__dirname, './storage.sqlite'));
  db.prepare(`INSERT INTO "warnings"(guild, user, reason, date, mod) VALUES ($guild, $user, $reason, $date, $mod)`).run({
    guild: msg.guild.id,
    user: member.id,
    reason: reason !== '' ? reason : 'Aucune raison n\'a été spécifié par le modérateur',
    date: new Date(),
    mod: msg.member.id
  })

  const {count} = db.prepare(`SELECT count('user') AS 'count' FROM "warnings" WHERE user = ${member.id} AND guild = ${msg.guild.id}`).get()
  
  const embed = new MessageEmbed()
  .setColor(0xcd6e57)
  .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
  .setDescription(stripIndents`
    **Membre:** ${member.user.tag}
    **Action:** Avertissement
    **Avertissements:** \`${count-1}\` => \`${count}\`
    **Raison:** ${reason !== '' ? reason : 'Aucune raison n\'a été spécifié par le modérateur'}`)
  .setFooter(msg.guild.name,msg.guild.iconURL({format: 'png'}))
  .setTimestamp();
  return msg.embed(embed);
}

const kickUser = (msg,member,reason) => {
  if(!member.kickable) return msg.channel.send(error('Impossible de kick ce membre !'))
  member.kick({ reason: reason !== '' ? reason : 'Aucune raison n\'a été spécifié par le modérateur' }).then(member => {
    const embed = new MessageEmbed()
    .setColor(0xcd6e57)
    .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
    .setDescription(stripIndents`
      **Membre:** ${member.user.tag}
      **Action:** Kick
      **Raison:** ${reason !== '' ? reason : 'Aucune raison n\'a été spécifié par le modérateur'}`)
    .setFooter(msg.guild.name,msg.guild.iconURL({format: 'png'}))
    .setTimestamp();
    msg.embed(embed)
  })
}

const banUser = (msg,member,reason) => {
  if(!member.bannable) return msg.channel.send(error('Impossible de bannir ce membre !'))
  member.ban({ reason: reason !== '' ? reason : 'Aucune raison n\'a été spécifié par le modérateur' }).then(member => {
    const embed = new MessageEmbed()
    .setColor(0xcd6e57)
    .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
    .setDescription(stripIndents`
      **Membre:** ${member.user.tag}
      **Action:** Ban
      **Raison:** ${reason !== '' ? reason : 'Aucune raison n\'a été spécifié par le modérateur'}`)
    .setFooter(msg.guild.name,msg.guild.iconURL({format: 'png'}))
    .setTimestamp();
    msg.embed(embed)
  })
}

const getWarnUser = (msg,member) => new Promise((resolve, reject) =>{
  const db = new Database(path.join(__dirname, './storage.sqlite'));
  const {count} = db.prepare(`SELECT count('user') AS 'count' FROM "warnings" WHERE user = ${member.id} AND guild = ${msg.guild.id}`).get()
  return resolve(count)
})

const getUserXp = (msg,user) => new Promise((resolve, reject) =>{
  const db = new Database(path.join(__dirname, './storage.sqlite'));
  const xp = db.prepare(`SELECT xp FROM "levels" WHERE user= ${user.id} AND guild= ${msg.guild.id}`).get()
  const users = db.prepare(`SELECT user FROM "levels" WHERE guild= ${msg.guild.id} ORDER BY xp DESC`).all()
  resolve({xp, users})
})

const addUserXp = (msg,user,newXp) => {
  const db = new Database(path.join(__dirname, './storage.sqlite'));
  const xp = db.prepare(`SELECT xp FROM "levels" WHERE user= ${user.id} AND guild= ${msg.guild.id}`).get()
  db.prepare(`UPDATE "levels" SET xp= ${xp.xp + newXp} WHERE user= ${user.id} AND guild= ${msg.guild.id}`).run()
}

const removeUserXp = (msg,user,newXp) => {
  const db = new Database(path.join(__dirname, './storage.sqlite'));
  const xp = db.prepare(`SELECT xp FROM "levels" WHERE user= ${user.id} AND guild= ${msg.guild.id}`).get()
  db.prepare(`UPDATE "levels" SET xp= ${xp.xp + newXp} WHERE user= ${user.id} AND guild= ${msg.guild.id}`).run()
}

const getUsersXpByGuild = (guild) => new Promise((resolve, reject) => {
  const db = new Database(path.join(__dirname, './storage.sqlite'));
  const users = db.prepare(`SELECT user,xp FROM "levels" WHERE guild= ${guild} ORDER BY xp DESC`).all()
  resolve(users)
})

const getLastUserReward = (guild,level) => new Promise((resolve, reject) =>{
  const db = new Database(path.join(__dirname, './storage.sqlite'));
  const reward = db.prepare(`SELECT role FROM "rewards" WHERE guild= ${guild.id} AND level <= ${level} ORDER BY level DESC LIMIT 1;`).get()
  resolve(reward)
})

const getUser = (user, client) => new Promise((resolve, reject) =>{
  client.users.fetch(user).then(resolve)
})

const getLevelFromXp = (xp) => {
  let level = 0
  while (xp >= getLevelXp(level)) {
    xp -= getLevelXp(level)
    level += 1
  }
  return level
}

const getRewards = (guild) => new Promise((resolve, reject) => {
  const db = new Database(path.join(__dirname, './storage.sqlite'));
  const result = db.prepare(`SELECT role,level FROM "rewards" WHERE guild= ${guild.id} ORDER BY level DESC`).get()
  resolve(result)
})

const getLevelXp = (level) => {
  return 5*(level*level)+50*level+100
}

const getCurrentLevelXp = (xp) => {
  const player_lvl = getLevelFromXp(xp)
  let x = 0
  for (let i = 0; i < player_lvl; i++) {
    x += getLevelXp(i)
  }
  return xp - x;
}

String.prototype.sansAccents = function() {
  return this.replace(/[ùûü]/g,"u").replace(/[îï]/g,"i").replace(/[àâä]/g,"a").replace(/[ôö]/g,"o").replace(/[éèêë]/g,"e").replace(/ç/g,"c");
}

module.exports = {
  makeWelcomeImage,
  addRole,
  Song,
  roundNumber,
  error,
  sendLogsBot,
  sendLogsServ,
  newUser,
  findChannel,
  findRole,
  guildAdd,
  invites,
  createTables,
  warnUser,
  getWarnUser,
  getUserXp,
  removeUserXp,
  addUserXp,
  levelImage,
  kickUser,
  banUser,
  getUsersXpByGuild,
  getUser,
  getLastUserReward,
  getLevelFromXp,
  getRewards
};
