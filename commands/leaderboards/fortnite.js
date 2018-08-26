const {get} = require('snekfetch'),
  moment = require('moment'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js')
 module.exports = class FortniteCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'fortnite',
      memberName: 'fortnite',
      group: 'leaderboards',
      aliases: ['ftn'],
      description: 'Récupérer les statistiques d\'un joueur fortnite',
      examples: ['!fortnite DraftMan_Dev pc'],
      guildOnly: false,
      args: [
        {
          key: 'user',
          prompt: 'De quel joueur voulez vous les statistiques',
          type: 'string'
        },
        {
          key: 'platform',
          prompt: 'Sur quelle platforme joue-t-il ? (`pc`, `xbox` or `psn`)?',
          type: 'string',
          validate: v => (/(pc|xbox|psn)/i).test(v) ? true : 'doit être une platforme valide, `pc`, `xbox` ou `psn`',
          parse: pf => pf.toLowerCase()
        }
      ]
    });
  }
   async run (msg, {user, platform}) {
    return msg.reply('The fortnite command is not finish sorry 😢')
    try {
      const res = await get(`https://api.fortnitetracker.com/v1/profile/${platform}/${user}`).set('TRN-Api-Key',process.env.fortnite_key),
        stats = await res.json(),
        embed = new MessageEmbed();
         console.log(stats)
         if (stats.error) throw new Error('noplayer');
         embed
        .setAuthor(`Statistiques fortnite de ${stats.epicUserHandle}`, msg.author.displayAvatarURL)
        .setDescription(`Voici les statistiques du joueur ${stats.epicUserHandle} sur le jeu [fortnite](https://www.epicgames.com/fortnite/fr/home).`)
        .setColor('#cd6e57')
        .addField("Victoires Solo", stats.stats.p2.top1.value, true)
        .addField("Victoires Duo", stats.stats.p10.top1.value, true)
        .addField("Victoires Section", stats.stats.p9.top1.value, true)
        .addField("Kills Solo", stats.stats.p2.kills.value, true)
        .addField("Kills Duo", stats.stats.p10.kills.value, true)
        .addField("Kills Section", stats.stats.p9.kills.value, true)
        .addField("Parties Solo", stats.stats.p2.matches.value, true)
        .addField("Parties Duo", stats.stats.p10.matches.value, true)
        .addField("Parties Section", stats.stats.p10.matches.value, true)
        // .addField("Temps de jeu Solo", (type.solo.minutesPlayed > 60 ? `${Math.trunc(type.solo.minutesPlayed/60)} heures` : `${type.solo.minutesPlayed} minutes`), true)
        // .addField("Temps de jeu Duo", (type.duo.minutesPlayed > 60 ? `${Math.trunc(type.duo.minutesPlayed/60)} heures` : `${type.duo.minutesPlayed} minutes`), true)
        // .addField("Temps de jeu Section", (type.squad.minutesPlayed > 60 ? `${Math.trunc(type.squad.minutesPlayed/60)} heures` : `${type.squad.minutesPlayed} minutes`), true)
        // .addField("Dernière partie Solo", moment(type.solo.lastMatch).fromNow(), true)
        // .addField("Dernière partie Duo", moment(type.duo.lastMatch).fromNow(), true)
        // .addField("Dernière partie Section", moment(type.squad.lastMatch).fromNow(), true)
        .setTimestamp(message.createdAt)
        .setFooter("DraftMan | Développeur FrontEnd & Graphiste", "https://www.draftman.fr/images/favicon.png")
       return msg.embed(embed);
    } catch (err) {
      console.log(err)
    }
  }
};