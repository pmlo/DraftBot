const {Command} = require('discord.js-commando'), 
  {roundNumber} = require('../../utils.js');

module.exports = class StopMusicCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'stop',
      memberName: 'stop',
      group: 'musique',
      aliases: ['kill', 'stfu', 'quit', 'leave', 'disconnect'],
      description: 'Stop la musique et vide la file d\'attente.',
      details: 'If there are more than 3 people (not counting the bot) a votestop is started. Staff can force the stop by adding `force` to the command',
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
      return msg.reply('there isn\'t any music playing right now.');
    }
    if (!queue.voiceChannel.members.has(msg.author.id)) {

      return msg.reply('you\'re not in the voice channel. They really don\'t want you to mess up their vibe man.');
    }
    if (!queue.songs[0].dispatcher) {
      return msg.reply('the song hasn\'t even begun playing yet. Why not give it a chance?');
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
        return msg.reply('you\'ve already voted to stop the music.');
      }

      vote.count += 1;
      vote.users.push(msg.author.id);
      if (vote.count >= threshold) {
        return msg.reply(this.stop(msg.guild, queue));
      }

      const remaining = threshold - vote.count,
        time = this.setTimeout(vote);

      return msg.say(`${vote.count} vote${vote.count > 1 ? 's' : ''} received so far, ${remaining} more ${remaining > 1 ? 'are' : 'is'} needed to stop. Five more seconds on the clock! The vote will end in ${time} seconds.`);
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

    return msg.say(`Starting a votestop. ${remaining} more vote${remaining > 1 ? 's are' : ' is'} required for the music to be stopped. The vote will end in ${time} seconds.`);
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

    return 'you\'ve just killed the party. Congrats 🎉';
  }

  setTimeout (vote) {
    const time = vote.start + 15000 - Date.now() + (vote.count - 1) * 5000;

    clearTimeout(vote.timeout);
    vote.timeout = setTimeout(() => {
      this.votes.delete(vote.guild);
      vote.queue.textChannel.send('The vote to stop the music has ended. Get outta here, party poopers.');
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