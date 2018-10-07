const {Command} = require('discord.js-commando');
const {roundNumber} = require('../../utils.js');

module.exports = class SkipSongCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'skip',
      memberName: 'skip',
      group: 'musique',
      aliases: ['next','suivant','passer'],
      description: 'Pemret de passer la muisque en cours.',
      details: 'Si il y a plus de 3 personnes dans le salon un vote sera lancé! Le staff peut forcer l\'arrêt avec ajoutant `force` à la commande.',
      examples: ['skip'],
      guildOnly: true,
    });
    this.votes = new Map();
  }

  run (msg, args) {
    const queue = this.queue.get(msg.guild.id);

    if (!queue) {
      return msg.reply('impossible de passer à la musique suivant vu qu\'il n\'y a pas de musique en attente! 🤔');
    }
    if (!queue.voiceChannel.members.has(msg.author.id)) {
      return msg.reply('vous devez être dans un salon vocal pour passer une musique.');
    }
    if (!queue.songs[0].dispatcher) {
      return msg.reply('il n\'y a aucune musique en cours. Pourquoi ne pas commencer par en lancer une?');
    }

    const threshold = Math.ceil((queue.voiceChannel.members.size - 1) / 3),
      force = threshold <= 1 ||
      queue.voiceChannel.members.size < threshold ||
      queue.songs[0].member.id === msg.author.id ||
      (msg.member.hasPermission('MANAGE_MESSAGES') && args.toLowerCase() === 'force');

    if (force) {
      return msg.reply(this.skip(msg.guild, queue));
    }

    const vote = this.votes.get(msg.guild.id);

    if (vote && vote.count >= 1) {
      if (vote.users.some(user => user === msg.author.id)) {
        return msg.reply('vous avez déjà voté pour passer à la musique suivante.');
      }

      vote.count += 1;
      vote.users.push(msg.author.id);
      if (vote.count >= threshold) {
        return msg.reply(this.skip(msg.guild, queue));
      }

      const remaining = threshold - vote.count,
        time = this.setTimeout(vote);

      return msg.say(`${vote.count} vote${vote.count > 1 ? 's' : ''} reçu jusqu'à présent, encore ${remaining} ${remaining > 1 ? 'votes sont nécessaires' : 'vote est nécessaire'} pour passer la musique. Le vote se terminera dans ${time} secondes.`);
    }
    const newVote = {       
        count: 1,
        users: [msg.author.id],
        queue,
        guild: msg.guild.id,
        start: Date.now(),
        timeout: null
      },
      remaining = threshold - 1,
      time = this.setTimeout(newVote);

    this.votes.set(msg.guild.id, newVote);

    return msg.say(`Lancement d'un vote. ${remaining} ${remaining > 1 ? 'votes sont nécessaires' : 'vote est nécessaire'} pour passer la musique. Le vote se terminera dans ${time} secondes.`);
  }

  skip (guild, queue) {
    if (this.votes.has(guild.id)) {
      clearTimeout(this.votes.get(guild.id).timeout);
      this.votes.delete(guild.id);
    }

    const song = queue.songs[0];

    song.dispatcher.end();

    return `Muisque passé: **${song}**`;
  }

  setTimeout (vote) {
    const time = vote.start + 15000 - Date.now() + (vote.count - 1) * 5000;

    clearTimeout(vote.timeout);
    vote.timeout = setTimeout(() => {
      this.votes.delete(vote.guild);
      vote.queue.textChannel.send('Le vote pour passer la musique en cours est terminé...');
    }, time);

    return roundNumber(time / 1000);
  }

  get queue () {
    if (!this._queue) {
      this._queue = this.client.registry.resolveCommand('musique:play').queue;
    }

    return this._queue;
  }
};