const fetch = require('node-fetch');
const {Command} = require('discord.js-commando');
const { stripIndents } = require('common-tags');
const moment = require('moment');
const {MessageEmbed} = require('discord.js');
const {deleteCommandMessages,ms,capitalizeFirstLetter} = require('../../utils.js');


module.exports = class LOLCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'overwatch',
      memberName: 'overwatch',
      group: 'leaderboards',
      description: 'Récupérer les statistiques d\'un joueur Overwatch',
      examples: ['overwatch DraftMan_Dev'],
      guildOnly: false,
      args: [
        {
          key: 'joueur',
          prompt: 'De quel joueur voulez vous les statistiques? (BattleTag)',
          type: 'string',
          validate: tag => {
            if (/[a-zA-Z0-9]+([#\-][0-9]{4,5})?/i.test(tag)) {
                return true;
            }

            return 'Le pseudo doit respecter le format suivant <nom>#<identifiant>, par exemple `DraftMan#11481`';
          },
          parse: tag => tag.replace(/#/g, '-'),
        },
      {
          key: 'plateforme',
          prompt: 'Sur quelle plateforme joue le joueur?',
          type: 'string',
          oneOf: ['pc', 'psn', 'xbl'],
          default: 'pc',
          parse: plat => plat.toLowerCase(),
      },
      {
          key: 'region',
          prompt: 'Dans quelle région joue le joueur?',
          type: 'string',
          oneOf: ['us', 'eu', 'asia'],
          default: 'eu',
          parse: reg => reg.toLowerCase(),
      }
      ]
    });
  }

  async run (msg, {joueur,plateforme,region}) {
    try {
      const owData = await fetch(`https://ow-api.com/v1/stats/${plateforme}/${region}/${joueur}/complete`);
      const data = await owData.json();

      console.log(data.error)

      if (data.error) throw new Error('noplayer');
      if (!data.competitiveStats.topHeroes) throw new Error('nostats');
      if (!data.quickPlayStats.topHeroes) throw new Error('nostats');

      const topCompetitiveHeroes = Object.keys(data.competitiveStats.topHeroes)
          .map(r => {
              const timePlayed = data.competitiveStats.topHeroes[r].timePlayed.split(':');
              let seconds;

              seconds = timePlayed.length === 3
                  ? Number(timePlayed[0] * 3600) + Number(timePlayed[1] * 60) + Number(timePlayed[0])
                  : Number(timePlayed[0] * 60) + Number(timePlayed[1]);

              return { hero: r, time: ms(`${seconds}s`) };
          })
          .sort((a, b) => a.time - b.time).reverse().slice(0, 3);
      const topQuickPlayHeroes = Object.keys(data.quickPlayStats.topHeroes)
          .map(r => {
              const timePlayed = data.quickPlayStats.topHeroes[r].timePlayed.split(':');
              let seconds;

              seconds = timePlayed.length === 3
                  ? Number(timePlayed[0] * 3600) + Number(timePlayed[1] * 60) + Number(timePlayed[0])
                  : Number(timePlayed[0] * 60) + Number(timePlayed[1]);

              return { hero: r, time: ms(`${seconds}s`) };
          })
          .sort((a, b) => a.time - b.time).reverse().slice(0, 3);

      const quickPlayStats = data.quickPlayStats.careerStats;
      const competitiveStats = data.competitiveStats.careerStats;

      const owEmbed = new MessageEmbed()
          .setAuthor(`Profile Overwatch du joueur ${joueur}`, `https://pbs.twimg.com/profile_images/983803209947873281/Mlll9kHm_400x400.jpg`)
          .setURL(`https://playoverwatch.com/en-us/career/${plateforme}/${joueur}`)
          .setThumbnail(data.icon)
          .setColor(0xcd6e57)
          .addField('Compte',
              stripIndents`
                  Level: **${data.level}**
                  Prestige level: **${data.level + data.prestige * 100}**
                  Rank: **${data.rating ? data.rating : 'Non classé'}${data.ratingName ? ` (${data.ratingName})` : null}**
                  Victoires: **${data.gamesWon ? data.gamesWon : 'Aucunes victroire'}**
              `,
              true
          )
          .addBlankField(true)
          .addField('Normal',
              stripIndents`
                  Coups de grâce: **${quickPlayStats.allHeroes.combat.finalBlows}**
                  Morts: **${quickPlayStats.allHeroes.combat.deaths}**
                  Dégâts : **${quickPlayStats.allHeroes.combat.damageDone}**
                  Healing: **${quickPlayStats.allHeroes.assists.healingDone}**
                  Objective Kills: **${quickPlayStats.allHeroes.combat.objectiveKills}**
                  Solo Kills: **${quickPlayStats.allHeroes.combat.soloKills}**
                  Temps de jeu: **${quickPlayStats.allHeroes.game.timePlayed}**
                  Victoires: **${data.quickPlayStats.games.won}**
                  Médailles d'or: **${data.quickPlayStats.awards.medalsGold}**
                  Médailles d'argent: **${data.quickPlayStats.awards.medalsSilver}**
                  Médailles de Bronze: **${data.quickPlayStats.awards.medalsBronze}**
              `,
              true
          )
          .addField('Compétition',
              stripIndents`
                  Coups de grâce: **${competitiveStats.allHeroes.combat.finalBlows}**
                  Morts: **${competitiveStats.allHeroes.combat.deaths}**
                  Dégâts: **${competitiveStats.allHeroes.combat.damageDone}**
                  Healing: **${competitiveStats.allHeroes.assists.healingDone}**
                  Objective Kills: **${competitiveStats.allHeroes.combat.objectiveKills}**
                  Solo Kills: **${competitiveStats.allHeroes.combat.soloKills}**
                  Temps de jeu: **${competitiveStats.allHeroes.game.timePlayed}**
                  Victoires: **${data.competitiveStats.games.won}**
                  Médailles d'or: **${data.competitiveStats.awards.medalsGold}**
                  Médailles d'argent: **${data.competitiveStats.awards.medalsSilver}**
                  Médailles de Bronze: **${data.competitiveStats.awards.medalsBronze}**
                `,
              true
          )
          .addField('Top Heros Normal',
              stripIndents`
                  **${capitalizeFirstLetter(topQuickPlayHeroes[0].hero)}** (${moment.duration(topQuickPlayHeroes[0].time, 'milliseconds').format('H [hours]', 2)})
                  **${capitalizeFirstLetter(topQuickPlayHeroes[1].hero)}** (${moment.duration(topQuickPlayHeroes[1].time, 'milliseconds').format('H [hours]', 2)})
                  **${capitalizeFirstLetter(topQuickPlayHeroes[2].hero)}** (${moment.duration(topQuickPlayHeroes[2].time, 'milliseconds').format('H [hours]', 2)})
              `,
              true
          )
          .addField('Top Heros Compétition',
              stripIndents`
                  **${capitalizeFirstLetter(topCompetitiveHeroes[0].hero)}** (${moment.duration(topCompetitiveHeroes[0].time, 'milliseconds').format('H [hours]', 2)})
                  **${capitalizeFirstLetter(topCompetitiveHeroes[1].hero)}** (${moment.duration(topCompetitiveHeroes[1].time, 'milliseconds').format('H [hours]', 2)})
                  **${capitalizeFirstLetter(topCompetitiveHeroes[2].hero)}** (${moment.duration(topCompetitiveHeroes[2].time, 'milliseconds').format('H [hours]', 2)})
              `,
              true
          );

      deleteCommandMessages(msg);

      return msg.embed(owEmbed);
  } catch (err) {
      if (/(noplayer)/i.test(err.toString())) {
          return msg.reply('Aucun joueur trouvé pour ce pseudo. Veuillez vérifier la plateforme (`pc`, `psn` ou `xbl`) ainsi que la région (`eu`, `us` ou `asia`)');
      } else if (/(nostats)/i.test(err.toString())) {
          return msg.reply('Le joueur à bien été trouvé mais il n\'a pas de statistiques enregistrés.');
      }
      console.log('Overwatch command => ',err)
    }
  }
};


