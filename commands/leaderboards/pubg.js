const fetch = require('node-fetch');
const moment = require('moment');
const {Command} = require('discord.js-commando');
const {MessageEmbed} = require('discord.js');
const {oneLine, stripIndents} = require('common-tags');

module.exports = class PubgCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'pubg',
      memberName: 'pubg',
      group: 'leaderboards',
      description: 'Récupérer les statistiques d\'un joueur PUBG',
      examples: ['pubg DraftMan pc-eu fpp'],
      guildOnly: false,
      args: [
        {
          key: 'user',
          prompt: 'De quel joueur voulez vous les statistiques?',
          type: 'string'
        },
        {
          key: 'shard',
          prompt: stripIndents`Sur quelle plate-forme et quelle région ce joueur joue-t-il.
                                \`\`\`
                                Options valides

                                xbox-as - Asia
                                xbox-eu - Europe
                                xbox-na - North America
                                xbox-oc - Oceania
                                pc-krjp - Korea
                                pc-jp - Japan
                                pc-na - North America
                                pc-eu - Europe
                                pc-ru - Russia
                                pc-oc - Oceania
                                pc-kakao - Kakao
                                pc-sea - South East Asia
                                pc-sa - South and Central America
                                pc-as - Asia
                                \`\`\``,
          type: 'string',
          validate: v => (/(xbox-as|xbox-eu|xbox-na|xbox-oc|pc-krjp|pc-jp|pc-na|pc-eu|pc-ru|pc-oc|pc-kakao|pc-sea|pc-sa|pc-as)/im).test(v)
            ? true
            : stripIndents`doit être une plateforme et une région valide.
                            \`\`\`
                            Options valides

                            xbox-as - Asia
                            xbox-eu - Europe
                            xbox-na - North America
                            xbox-oc - Oceania
                            pc-krjp - Korea
                            pc-jp - Japan
                            pc-na - North America
                            pc-eu - Europe
                            pc-ru - Russia
                            pc-oc - Oceania
                            pc-kakao - Kakao
                            pc-sea - South East Asia
                            pc-sa - South and Central America
                            pc-as - Asia
                            \`\`\``,
          parse: p => p.toLowerCase()
        },
        {
          key: 'type',
          prompt: 'Quel type de jeu ciblez vous?',
          type: 'string',
          validate: v => (/(normal|fpp)/i).test(v) ? true : 'doit être un type valide, `normal` ou `fpp`',
          parse: pf => pf.toLowerCase()
        }
      ]
    });
  }

  async run (msg, {user, shard, type}) {
    try {
      const headers = {
          Authorization: `Bearer ${process.env.pubgkey}`,
          Accept: 'application/vnd.api+json'
        },
        seasonReq = await fetch(`https://api.pubg.com/shards/${shard}/seasons`, {headers}),
        seasons = await seasonReq.json(),
        playerReq = await fetch(`https://api.pubg.com/shards/${shard}/players?filter[playerNames]=${user}`, {headers}),
        players = await playerReq.json(),
        currentSeason = seasons.data.filter(season => season.attributes.isCurrentSeason)[0].id,
        playerId = players.data[0].id,
        playerName = players.data[0].attributes.name,
        playerStatsReq = await fetch(`https://api.pubg.com/shards/${shard}/players/${playerId}/seasons/${currentSeason}`, {headers}),
        playerStats = await playerStatsReq.json();

        const pubEmbed = new MessageEmbed()
        .setTitle(`Statistiques PUBG de ${playerName}`)
        // .setThumbnail('https://favna.xyz/images/ribbonhost/pubgicon.png')
        .setColor(0xcd6e57)

        if(type === 'normal') 
        pubEmbed
        .addField('Solos Stats', stripIndents`
          Victoires: **${playerStats.data.attributes.gameModeStats.solo.wins}**
          Défaites: **${playerStats.data.attributes.gameModeStats.solo.losses}**
          Assists: **${playerStats.data.attributes.gameModeStats.solo.assists}**
          Kills: **${playerStats.data.attributes.gameModeStats.solo.kills}**
          Headshots: **${playerStats.data.attributes.gameModeStats.solo.headshotKills}**
          Suicides: **${playerStats.data.attributes.gameModeStats.solo.suicides}**
          `, true)
        .addField('Duos Stats', stripIndents`
          Victoires: **${playerStats.data.attributes.gameModeStats.duo.wins}**
          Défaites: **${playerStats.data.attributes.gameModeStats.duo.losses}**
          Assists: **${playerStats.data.attributes.gameModeStats.duo.assists}**
          Kills: **${playerStats.data.attributes.gameModeStats.duo.kills}**
          Headshots: **${playerStats.data.attributes.gameModeStats.duo.headshotKills}**
          Suicides: **${playerStats.data.attributes.gameModeStats.duo.suicides}**
          `, true)
        .addField('Squad Stats', stripIndents`
          Victoires: **${playerStats.data.attributes.gameModeStats.squad.wins}**
          Défaites: **${playerStats.data.attributes.gameModeStats.squad.losses}**
          Assists: **${playerStats.data.attributes.gameModeStats.squad.assists}**
          Kills: **${playerStats.data.attributes.gameModeStats.squad.kills}**
          Headshots: **${playerStats.data.attributes.gameModeStats.squad.headshotKills}**
          Suicides: **${playerStats.data.attributes.gameModeStats.squad.suicides}**
          `, true);

        else if(type === 'fpp') pubEmbed
        .addField('Duos FPP Stats', stripIndents`
          Victoires: **${playerStats.data.attributes.gameModeStats['duo-fpp'].wins}**
          Défaites: **${playerStats.data.attributes.gameModeStats['duo-fpp'].losses}**
          Assists: **${playerStats.data.attributes.gameModeStats['duo-fpp'].assists}**
          Kills: **${playerStats.data.attributes.gameModeStats['duo-fpp'].kills}**
          Headshots: **${playerStats.data.attributes.gameModeStats['duo-fpp'].headshotKills}**
          Suicides: **${playerStats.data.attributes.gameModeStats['duo-fpp'].suicides}**
          `, true)
        .addField('Solos FPP Stats', stripIndents`
          Victoires: **${playerStats.data.attributes.gameModeStats['solo-fpp'].wins}**
          Défaites: **${playerStats.data.attributes.gameModeStats['solo-fpp'].losses}**
          Assists: **${playerStats.data.attributes.gameModeStats['solo-fpp'].assists}**
          Kills: **${playerStats.data.attributes.gameModeStats['solo-fpp'].kills}**
          Headshots: **${playerStats.data.attributes.gameModeStats['solo-fpp'].headshotKills}**
          Suicides: **${playerStats.data.attributes.gameModeStats['solo-fpp'].suicides}**
          `, true)
        .addField('Squad FPP Stats', stripIndents`
          Victoires: **${playerStats.data.attributes.gameModeStats['squad-fpp'].wins}**
          Défaites: **${playerStats.data.attributes.gameModeStats['squad-fpp'].losses}**
          Assists: **${playerStats.data.attributes.gameModeStats['squad-fpp'].assists}**
          Kills: **${playerStats.data.attributes.gameModeStats['squad-fpp'].kills}**
          Headshots: **${playerStats.data.attributes.gameModeStats['squad-fpp'].headshotKills}**
          Suicides: **${playerStats.data.attributes.gameModeStats['squad-fpp'].suicides}**
          `, true);

      return msg.embed(pubEmbed);
    } catch (err) {
      return console.log(err)
    }
  }
};