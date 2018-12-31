const {get} = require('snekfetch');
const {Command} = require('discord.js-commando');
const {MessageEmbed} = require('discord.js');
const _ = require('lodash');

const SteamAPI = require('steamapi');
const steam = new SteamAPI(process.env.steam_api);

module.exports = class PubgCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'brawlhalla',
      memberName: 'brawlhalla',
      group: 'leaderboards',
      description: 'Récupérer les statistiques d\'un joueur PUBG',
      examples: ['brawlhalla DraftMan_Dev'],
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
        const status = await msg.say(`Recherche du profil \`${user}\``)

        const id = await steam.resolve(user)
        
        if(id === undefined){
          return status.edit(`:x: Le profil \`${user}\` n'existe pas où est privé`)
        }

        const profil = await steam.getUserSummary(id)

        status.edit(`Profil steam de \`${user}\` trouvé !`)

        const brawlhalla_rq = await get(`https://api.brawlhalla.com/search?api_key=${process.env.brawlhalla_api}&steamid=${id}`);
        const {brawlhalla_id} = brawlhalla_rq.body; 
        if(brawlhalla_id === undefined){
          return status.edit(`:x: Impossible de trouver le joueur brawlhalla \`${user}\``)
        }

        status.edit(`Profil brawlhalla de \`${user}\` trouvé !`)

        const req = await get(`https://api.brawlhalla.com/player/${brawlhalla_id}/stats?api_key=${process.env.brawlhalla_api}`)
        const result = req.body;

        if(result === undefined){
          return status.edit(`:x: Impossible de trouver les statistiques brawlhalla de \`${user}\``)
        }

        status.edit(`Statistiques brawlhalla de \`${user}\` trouvés !`)

        const legendMG = result.legends.reduce((accumulator, legend) => accumulator.games > legend.games ? accumulator : legend)

        const legendMW = result.legends.reduce((accumulator, legend) => (accumulator.wins/accumulator.games) < (legend.wins/legend.games) && legend.games > 20 ? legend : accumulator)

        result.legends.forEach(legend => console.log(legend.legend_name_key,legend.games < 20))

        const BrawlEmbed = new MessageEmbed()
        .setTitle(`Statistiques Brawlhalla de ${result.name}`)
        .setURL(`https://brawldb.com/player/stats/${brawlhalla_id}`)
        .setThumbnail(profil.avatar.large)
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


