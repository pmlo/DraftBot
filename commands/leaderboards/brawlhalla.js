const fetch = require('node-fetch');
const moment = require('moment');
const {Command} = require('discord.js-commando');
const {MessageEmbed} = require('discord.js');
const {oneLine, stripIndents} = require('common-tags');

var rp = require('request-promise');
var parseString = require('xml2js').parseString;

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
    try {
        const steamId = await getSteamID64(user);
        const brawlhalla_rq = await fetch(`https://api.brawlhalla.com/search?api_key=${api_key}&steamid=${steamId}`);
        console.log(brawlhalla_rq)

        //check what is the brawlhalla id in the request

        //do the request with the brawlhalla id

        const res = await fetch(`url`);

        const data = await res.json();

        const BrawlEmbed = new MessageEmbed()
        .setTitle(`Statistiques Brawlhalla de ${playerName}`)
        .addField('Général', stripIndents`
          Team: **${team}**
          Victoires: **${victoires}**
          Défaites: **${defaites}**
          Ratio: **${ratio}**
          Parties: **${parties}**
        `)
        .addField('Legendaires', stripIndents`
          Plus utilisé: ****
          Moins utilisé: ****
          Ratio de victoires: ****
          Plus de dégats par secondes: ***** 
        `)
        .addField('Armes', stripIndents`
          Plus utilisé: ****
          Moins utilisé: ****
          Ratio de victoires: ****
          Plus de dégats par secondes: ***** 
        `)
        .setColor(0xcd6e57)

      return msg.embed(BrawlEmbed);
    } catch (err) {
      return console.log(err)
    }
  }

  getSteamID64(pseudo){
    const url = `https://steamcommunity.com/id/${pseudo.toLowerCase()}`
    return rp(url).then(function (xml) {
      return new Promise(function(resolve, reject) {
        parseString(xml, {
          explicitArray : false,
          ignoreAttrs : true,
          trim : true
        }, function(err, result){
          if (err) {
            reject(err);
          } else {
            resolve(result["profile"]["steamID64"]);
          }
        });
      });
    });
  }
};


