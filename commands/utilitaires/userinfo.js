const {Command} = require('discord.js-commando');
const {MessageEmbed} = require('discord.js');
const {deleteCommandMessages,getLevelFromXp,getUserXp,getWarnUser} = require('../../utils.js');
const moment = require('moment');
moment().locale('fr');

module.exports = class AvatarCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'userinfo',
      memberName: 'userinfo',
      group: 'utilitaires',
      aliases: ['info'],
      description: 'Afficher les informations d\'un joueur',
      examples: ['info DraftMan'],
      args: [{
        key: 'utilisateur',
        prompt: 'De quel utilisateur voulez-vous des informations ?',
        type: 'user|member',
        default: ''
      }]
    });
  }

  async run (msg, {utilisateur}) {
    deleteCommandMessages(msg);

    utilisateur = utilisateur ? utilisateur : msg.author 

    let user = utilisateur.user;
    let member = utilisateur;

    if(!user){
      user = utilisateur;
      member = msg.guild ? msg.guild.member(utilisateur) : null;
    }

    let presence;
    const fields = [];
    switch (user.presence.status) {
      case 'online': presence = 'Connecté'; break;
      case 'offline': presence = 'Déconnecté'; break;
      case 'idle': presence = 'AFK'; break;
      case 'dnd': presence = 'Non distribué'; break;
      default: presence = 'Non donnée'; break;
    }

    fields.push({name: 'Mention',value: user,inline: true})
    fields.push({name: 'ID',value: user.id,inline: true})

    if(member && member.displayName !== user.username)
    fields.push({name: 'Surnom',value: member.displayName,inline: true})
    
    fields.push({name: 'Status',value: presence,inline: true})

    if(user.presence.name)
    fields.push({name: 'Activité',value: user.presence.name,inline: true})

    fields.push({name: ''})

    if(member && member.guild.settings.get('levelSystem') !== false){
      const {xp,users} = await getUserXp(msg,user)
      const exp = xp === undefined ? 0 : xp.xp
      const place = users.map(u => u.user).indexOf(user.id)+1;
      fields.push({name: 'Niveau',value: `Niveau ${getLevelFromXp(exp)} (${exp}xp) Place #${place}`,inline: true})
    }

    if(member){
      const count = await getWarnUser(msg,user)
      fields.push({name: 'Avertissements',value: count ,inline: true})
    }

    if(member) 
    fields.push({name: 'Roles',value: member.roles.map(r => r.name).join(' | '),inline: false})

    fields.push({name: 'Création du compte',value: moment(user.createdTimestamp).format('dddd Do MMMM YYYY [à] hh:mm'),inline: true})
    
    if(member)
    fields.push({name: 'Date d\'arrivé',value: moment(member.joinedTimestamp).format('dddd Do MMMM YYYY [à] hh:mm'),inline: true})

    const embed = new MessageEmbed()
    .setAuthor(utilisateur.username,utilisateur.displayAvatarURL({format: 'png'}))
    .setColor(0xcd6e57)
    .setThumbnail(utilisateur.displayAvatarURL())
    .setDescription(`Voici les informations concerant l'utilisateur \`${utilisateur.tag}\``)
    .setTimestamp();

    fields.forEach(field => {
      field.name !== '' ? embed.addField(field.name,field.value,field.inline) : embed.addBlankField(true)
    });

    return msg.embed(embed);
  }
};