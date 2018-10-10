const {Command, util} = require('discord.js-commando');
const {MessageEmbed} = require('discord.js');
const {Song} = require('../../utils.js');

module.exports = class ShuffleCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'shuffle',
      memberName: 'shuffle',
      group: 'musique',
      aliases: ['remix', 'mixtape','random','melange'],
      description: 'Permet de mélanger les musiques de la queue.',
      examples: ['shuffle'],
      guildOnly: true
    });
  }

  run (msg) {
    const queue = this.queue.get(msg.guild.id);

    if (!queue) {
      return msg.reply('il n\'y a aucune musique dans la file d\'attente. Pourquoi ne pas y ajouter quelques titres? 😎');
    }

    if (queue.songs.length <= 2) {
      return msg.reply('je ne peut pas mélanger une file d\'attente inférieure à 2 musiques. Pourquoi ne pas ajouter d\'autres musiques ?');
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
      .setColor(0xcd6e57)
      .setAuthor(`${msg.author.tag} (${msg.author.id})`, msg.author.displayAvatarURL({format: 'png'}))
      .setImage(currentSong.thumbnail)
      .setDescription(`__**10 premières musiques de la file d'attente**__\n
        ${paginated.items.map(song => `**-** ${!isNaN(song.id) ? `${song.name}
        (${song.lengthString})` : `[${song.name}](${`https://www.youtube.com/watch?v=${song.id}`})`} (${song.lengthString})`).join('\n')}\n
            ${paginated.maxPage > 1 ? `\nUtilisez ${msg.usage()} pour voir une page en particulier.\n` : ''}\n
            **En cours:** ${!isNaN(currentSong.id) ? `${currentSong.name}` : `[${currentSong.name}](${`https://www.youtube.com/watch?v=${currentSong.id}`})`}\n
            **Progression:** ${!currentSong.playing ? 'En pause: ' : ''}${Song.timeString(currentTime)} / ${currentSong.lengthString} (${currentSong.timeLeft(currentTime)} restant)
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