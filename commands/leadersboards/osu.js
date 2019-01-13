const fetch = require('node-fetch');
const moment = require('moment');
const {Command} = require('discord.js-commando');
const {MessageEmbed} = require('discord.js');
const _ = require('lodash');
const {deleteCommandMessages} = require('../../utils.js');

module.exports = class PubgCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'osu',
      memberName: 'osu',
      group: 'leadersboards',
      description: 'Récupérer les statistiques d\'un joueur OSU',
      examples: ['osu DraftMan_Dev'],
      guildOnly: false,
      args: [
        {
          key: 'user',
          prompt: 'De quel joueur voulez vous les statistiques?',
          type: 'string'
        }
      ]
    });
  }

  async run (msg, {user}) {
    deleteCommandMessages(msg);
    const status = await msg.say(`Recherche du profil \`${user}\``)

    const osu_rq = await fetch(`https://osu.ppy.sh/api/get_user?k=${process.env.osu_api}&u=${user}`);
    const response = await osu_rq.json()
    
    if(response.length === 0){
      return status.edit(`:x: Le profil \`${user}\` n'existe pas où est privé :pensive:`)
    }

    status.edit(`Statistiques de \`${response[0].username}\` trouvés !`)

    let totalSeconds = response[0].total_seconds_played;
    const hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    const minutes = Math.floor(totalSeconds / 60);

    const osuEmbed = new MessageEmbed()
    .setTitle(`Statistiques OSU du joueur ${response[0].username}`)
    .setURL(`https://osu.ppy.sh/users/${response[0].user_id}`)
    .setThumbnail(`https://cdn.discordapp.com/attachments/188630481301012481/188646370817605634/splash.png`)
    .addField(`Général`, `Parties : **${response[0].playcount}**\nRanked score : **${response[0].ranked_score}**\nPrécision: **${Math.round(response[0].accuracy)}%**\nPP: **${response[0].pp_raw}**`)
    .addField(`Count ranks`, `Count rank SS: **${response[0].count_rank_ss}**\nCount rank SS+: **${response[0].count_rank_ssh}**\nCount rank S: **${response[0].count_rank_s}**\nCount rank S+: **${response[0].count_rank_sh}**`)
    .addField(`Divers`, `Temps de jeu: **${hours}h ${minutes}min**\nDate d'inscription: **${moment(response[0].join_date,'YYYY-MM-DD hh:mm:ss').format('DD/MM/YYYY')}**`)
    .setFooter(msg.guild ? msg.guild.name : '',msg.guild ? msg.guild.iconURL({format: 'png'}) : msg.client.user.avatarURL({format: 'png'}))
    .setColor(0xcd6e57)
    .setTimestamp()

    return msg.embed(osuEmbed);
  }
};


