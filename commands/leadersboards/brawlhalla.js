const {get} = require('snekfetch');
const {Command} = require('discord.js-commando');
const {MessageEmbed} = require('discord.js');
const _ = require('lodash');
const {deleteCommandMessages} = require('../../utils.js');

const SteamAPI = require('steamapi');
const steam = new SteamAPI(process.env.steam_api);

module.exports = class PubgCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'brawlhalla',
      memberName: 'brawlhalla',
      group: 'leadersboards',
      description: 'Récupérer les statistiques d\'un joueur Brawlhalla',
      examples: ['brawlhalla DraftMan_Dev'],
      guildOnly: false,
      args: [
        {
          key: 'user',
          prompt: 'De quel joueur voulez-vous les statistiques?',
          type: 'string'
        }
      ]
    });
  }

  async run (msg, {user}) {
    deleteCommandMessages(msg);
    const status = await msg.say(`Recherche du profil \`${user}\``)

    const id = await steam.resolve(user)
    
    if(id === undefined){
      return status.edit(`:x: Le profil \`${user}\` n'existe pas ou est privé :pensive:`)
    }

    status.edit(`Profil steam de \`${user}\` trouvé !`)

    const brawlhalla_rq = await get(`https://api.brawlhalla.com/search?api_key=${process.env.brawlhalla_api}&steamid=${id}`);
    const {brawlhalla_id} = brawlhalla_rq.body; 
    if(brawlhalla_id === undefined){
      return status.edit(`:x: Impossible de trouver le joueur brawlhalla \`${user}\` :pensive:`)
    }

    status.edit(`Profil brawlhalla de \`${user}\` trouvé !`)

    const req = await get(`https://api.brawlhalla.com/player/${brawlhalla_id}/stats?api_key=${process.env.brawlhalla_api}`)
    const result = req.body;

    if(result === undefined){
      return status.edit(`:x: Impossible de trouver les statistiques brawlhalla de \`${user}\` :pensive:`)
    }

    status.edit(`Statistiques brawlhalla de \`${user}\` trouvées !`)

    const legendMG = result.legends.reduce((accumulator, legend) => accumulator.games > legend.games ? accumulator : legend)

    const legendMW = result.legends.reduce((accumulator, legend) => (accumulator.wins/accumulator.games) < (legend.wins/legend.games) && legend.games > 20 ? legend : accumulator)

    const BrawlEmbed = new MessageEmbed()
    .setTitle(`Statistiques Brawlhalla de ${result.name}`)
    .setURL(`https://brawldb.com/player/stats/${brawlhalla_id}`)
    .setThumbnail(`https://yt3.ggpht.com/a-/AAuE7mCYWJr9lpy54QI2pTMAA8s-VWY-fOkuXTzQSQ=s900-mo-c-c0xffffffff-rj-k-no`)
    .addField(result.name, `[${result.clan.clan_name}](https://brawldb.com/clan/info/${result.clan.clan_id}) (${result.clan.personal_xp}/${result.clan.clan_xp}xp)`)
    .addField('Victoires', result.wins,true)
    .addField('Défaites', result.games - result.wins,true)
    .addField('Ratio', ((result.wins/result.games)*100).toFixed(1)+'%',true)
    .addField('Parties', result.games,true)
    .addField('Legendaire le plus utilisé', _.startCase(legendMG.legend_name_key),true)
    .addField('Legendaire le plus victorieux', `${_.startCase(legendMW.legend_name_key)} (${((legendMW.wins/legendMW.games)*100).toFixed(1)}%)`,true)
    .setFooter(msg.guild ? msg.guild.name : '',msg.guild ? msg.guild.iconURL({format: 'png'}) : msg.client.user.avatarURL({format: 'png'}))
    .setColor(0xcd6e57)
    .setTimestamp()

    return msg.embed(BrawlEmbed);
  }
};


