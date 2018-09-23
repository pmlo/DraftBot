const {Command, util} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {Song} = require('../../utils.js');

module.exports = class ShuffleCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'shuffle',
      memberName: 'shuffle',
      group: 'musique',
      aliases: ['remix', 'mixtape','random'],
      description: 'Shuffles the current queue of songs',
      details: 'Shuffles using a [modern version of the Fisher-Yates shuffle algorithm](https://en.wikipedia.org/wiki/Fisher–Yates_shuffle#The_modern_algorithm)',
      examples: ['shuffle'],
      guildOnly: true
    });
  }

  run (msg) {
    const queue = this.queue.get(msg.guild.id);

    if (!queue) {
      return msg.reply('there are no songs in the queue. Why not put something in my jukebox?');
    }

    if (queue.songs.length <= 2) {
      return msg.reply('cannot shuffle a queue smaller than 2 tracks. Why not queue some more tunes?');
    }

    const currentPlaying = queue.songs[0];

    queue.songs.shift();
    queue.songs = this.shuffle(queue.songs);
    queue.songs.unshift(currentPlaying);

    const currentSong = queue.songs[0],
      currentTime = currentSong.dispatcher ? currentSong.dispatcher.streamTime / 1000 : 0,
      embed = new MessageEmbed(),
      paginated = util.paginate(queue.songs, 1, Math.floor(10));

    embed
      .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
      .setAuthor(`${msg.author.tag} (${msg.author.id})`, msg.author.displayAvatarURL({format: 'png'}))
      .setImage(currentSong.thumbnail)
      .setDescription(`__**First 10 songs in the queue**__\n
        ${paginated.items.map(song => `**-** ${!isNaN(song.id) ? `${song.name}
        (${song.lengthString})` : `[${song.name}](${`https://www.youtube.com/watch?v=${song.id}`})`} (${song.lengthString})`).join('\n')}\n
            ${paginated.maxPage > 1 ? `\nUse ${msg.usage()} to view a specific page.\n` : ''}\n
            **Now playing:** ${!isNaN(currentSong.id) ? `${currentSong.name}` : `[${currentSong.name}](${`https://www.youtube.com/watch?v=${currentSong.id}`})`}\n
            **Progress:** ${!currentSong.playing ? 'Paused: ' : ''}${Song.timeString(currentTime)} / ${currentSong.lengthString} (${currentSong.timeLeft(currentTime)} left)
            `);

    return msg.embed(embed);
  }

  get queue () {
    if (!this._queue) {
      this._queue = this.client.registry.resolveCommand('musique:play').queue;
    }

    return this._queue;
  }

  shuffle (a) {
    for (let i = a.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));

      [a[i], a[j]] = [a[j], a[i]];
    }

    return a;
  }
};