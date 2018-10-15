const {get} = require('snekfetch');
const moment = require('moment');
const {Command} = require('discord.js-commando');
const {MessageEmbed} = require('discord.js');

module.exports = class FortniteCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'fortnite',
      memberName: 'fortnite',
      group: 'leaderboards',
      aliases: ['ftn'],
      description: 'Récupérer les statistiques d\'un joueur fortnite',
      examples: ['fortnite DraftMan_Dev pc'],
      guildOnly: false,
      args: [
        {
          key: 'user',
          prompt: 'De quel joueur voulez vous les statistiques',
          type: 'string'
        },
        {
          key: 'platforme',
          prompt: 'Sur quelle platforme joue le joueur ? (`pc`, `xbox` or `ps4`)?',
          type: 'string',
          validate: v => (/(pc|xbox|ps4)/i).test(v) ? true : 'doit être une platforme valide, `pc`, `xbox` ou `ps4`',
          parse: pf => pf.toLowerCase()
        }
      ]
    });
  }
   async run (msg, {user, platforme}) {
    return msg.reply('The fortnite command is not finish sorry 😢')
    try {
      const res = await get(`https://fortnite.y3n.co/v2/player/${user}`).set('X-Key',process.env.fortnite_key);
      const stats = await res.body;

      console.log(stats.br.stats[plateforme].solo.wins)
      const embed = new MessageEmbed()
      .setAuthor(`Statistiques fortnite de ${stats.displayName}`, message.author.displayAvatarURL)
      .setDescription(`Voici les statistiques du joueur ${stats.displayName} sur le jeu [fortnite](https://www.epicgames.com/fortnite/fr/home).`)
      .setColor(0xcd6e57)
      .addField("Victoires Solo", stats.br.stats[plateforme].solo.wins, true)
      .addField("Victoires Duo", stats.br.stats[plateforme].duo.wins, true)
      .addField("Victoires Section", stats.br.stats[plateforme].squad.wins, true)
      .addField("Kills Solo", stats.br.stats[plateforme].solo.kills, true)
      .addField("Kills Duo", stats.br.stats[plateforme].duo.kills, true)
      .addField("Kills Section", stats.br.stats[plateforme].squad.kills, true)
      .addField("Morts Solo", stats.br.stats[plateforme].solo.deaths, true)
      .addField("Morts Duo", stats.br.stats[plateforme].duo.deaths, true)
      .addField("Morts Section", stats.br.stats[plateforme].squad.deaths, true)
      .addField("Temps de jeu Solo", (stats.br.stats[plateforme].solo.minutesPlayed > 60 ? `${Math.trunc(stats.br.stats[plateforme].solo.minutesPlayed/60)} heures` : `${stats.br.stats[plateforme].solo.minutesPlayed} minutes`), true)
      .addField("Temps de jeu Duo", (stats.br.stats[plateforme].duo.minutesPlayed > 60 ? `${Math.trunc(stats.br.stats[plateforme].duo.minutesPlayed/60)} heures` : `${stats.br.stats[plateforme].duo.minutesPlayed} minutes`), true)
      .addField("Temps de jeu Section", (stats.br.stats[plateforme].squad.minutesPlayed > 60 ? `${Math.trunc(stats.br.stats[plateforme].squad.minutesPlayed/60)} heures` : `${stats.br.stats[plateforme].squad.minutesPlayed} minutes`), true)
      .addField("Dernière partie Solo", moment(stats.br.stats[plateforme].solo.lastMatch).fromNow(), true)
      .addField("Dernière partie Duo", moment(stats.br.stats[plateforme].duo.lastMatch).fromNow(), true)
      .addField("Dernière partie Section", moment(stats.br.stats[plateforme].squad.lastMatch).fromNow(), true)
      return msg.embed(embed);
    } catch (err) {
      console.log(err)
      msg.say(error('Une erreur s\'est produite veuillez nous excusez !'))
    }
  }
};