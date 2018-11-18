const {Command} = require('discord.js-commando');
const {roundNumber} = require('../../utils.js');

module.exports = class StopMusicCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'stop',
      memberName: 'stop',
      group: 'musique',
      aliases: ['kill', 'stfu', 'quit', 'leave', 'disconnect'],
      examples: ['stop'],
      description: 'Stopper la musique et vider la file d\'attente.',
      details: 'Si il y a plus de 3 personnes un vote sera lancé pour valider la décision! Le staff peut forcer l\'arrêt avec ajoutant `force` à la commande.',
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      }
    });
    this.votes = new Map();
  }

  /* eslint-disable max-statements*/
  run (msg, args) {
    const queue = this.queue.get(msg.guild.id);

    if (!queue) {
      return msg.reply('il n\'y a aucune musique en cours');
    }
    if (!queue.voiceChannel.members.has(msg.author.id)) {
      return msg.reply('vous devez être dans un salon vocal pour arrêter une musique.');
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
      return msg.reply(this.stop(msg.guild, queue));
    }

    const vote = this.votes.get(msg.guild.id);

    if (vote && vote.count >= 1) {
      if (vote.users.some(user => user === msg.author.id)) {
        return msg.reply('vous avez déjà voté pour arrêter à la musique en cours.');
      }

      vote.count += 1;
      vote.users.push(msg.author.id);
      if (vote.count >= threshold) {
        return msg.reply(this.stop(msg.guild, queue));
      }

      const remaining = threshold - vote.count,
        time = this.setTimeout(vote);

        return msg.say(`${vote.count} vote${vote.count > 1 ? 's' : ''} reçu jusqu'à présent, encore ${remaining} ${remaining > 1 ? 'votes sont nécessaires' : 'vote est nécessaire'} pour stopper la musique. Le vote se terminera dans ${time} secondes.`);
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

    return msg.say(`Lancement d'un vote. ${remaining} ${remaining > 1 ? 'votes sont nécessaires' : 'vote est nécessaire'} pour stopper la musique. Le vote se terminera dans ${time} secondes.`);
  }

  stop (guild, queue) {
    if (this.votes.has(guild.id)) {
      clearTimeout(this.votes.get(guild.id).timeout);
      this.votes.delete(guild.id);
    }

    const song = queue.songs[0];

    queue.songs = [];
    if (song.dispatcher) {
      song.dispatcher.end();
    }

    return 'tu viens purement et simplement de détruire la fête. Félicitations, bravo, c\'est le pompon 🎉';
  }

  setTimeout (vote) {
    const time = vote.start + 15000 - Date.now() + (vote.count - 1) * 5000;

    clearTimeout(vote.timeout);
    vote.timeout = setTimeout(() => {
      this.votes.delete(vote.guild);
      vote.queue.textChannel.send('Le vote pour arrêter la musique en cours est terminé...');
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