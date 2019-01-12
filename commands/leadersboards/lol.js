const fetch = require('node-fetch');
const {Command} = require('discord.js-commando');
const moment = require('moment');
const {MessageEmbed} = require('discord.js');
const _ = require('lodash');


module.exports = class PubgCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'lol',
      memberName: 'lol',
      group: 'leadersboards',
      description: 'Récupérer les statistiques d\'un joueur League of Legends',
      examples: ['lol DraftMan_Dev'],
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
        const status = await msg.say(`Recherche du joueur \`${user}\``)

        const summoner = await fetch(`https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${user}?api_key=${process.env.lol_api}`)
        const userP = await summoner.json();

        if(userP.status !== undefined){
          return status.edit(`:x: Le profil du joueur \`${user}\` n'existe pas :pensive:`)
        }

        status.edit(`Profil League of Legend de \`${user}\` trouvé !`)

        const match = await fetch(`https://na1.api.riotgames.com/lol/match/v4/matchlists/by-account/${userP.accountId}?api_key=${process.env.lol_api}`)
        const {totalGames, matches} = await match.json()
        const lastMach = matches[0]

        const league = await fetch(`https://na1.api.riotgames.com//lol/league/v4/positions/by-summoner/${userP.id}?api_key=${process.env.lol_api}`)
        const [{wins,losses,rank,tier,leagueName}] = await league.json()

        const championsRq = await fetch(`http://ddragon.leagueoflegends.com/cdn/6.24.1/data/fr_FR/champion.json`)
        const champions = await championsRq.json();
        const champion = Object.entries(champions.data).find(a => a[1].key == lastMach.champion)[1]
        
        const LolEmbed = new MessageEmbed()
        .setTitle(`Statistiques League of Legends de ${userP.name}`)
        .setURL(``)
        .setThumbnail(`https://www.eclypsia.com/content/LoL/Logo/Logo_Compet/logo_lol.png`)
        .setDescription(`**${userP.name}** (${tier} ${rank})\nLeague: ${leagueName}`)
        .addField('Victoires', wins,true)
        .addField('Défaites', losses,true)
        .addField('Parties', `${wins + losses} (total ${totalGames})`,true)
        .addField('Ratio',`${((wins/(wins+losses))*100).toFixed(1)}%`,true)
        .addField('Dernière partie', `Champion: ${champion.name} (${champion.title})\nRole: ${lastMach.role}\nLane: ${lastMach.lane}\n${moment(lastMach.timestamp).fromNow()}`,false)
        .setFooter(msg.guild ? msg.guild.name : '',msg.guild ? msg.guild.iconURL({format: 'png'}) : msg.client.user.avatarURL({format: 'png'}))
        .setColor(0xcd6e57)
        .setTimestamp()

        return msg.embed(LolEmbed);
  }
};


