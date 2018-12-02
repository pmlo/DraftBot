const {Command, util} = require('discord.js-commando')
const {oneLine, stripIndents} = require('common-tags')
const {Song} = require('../../utils.js');

module.exports = class ViewQueueCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'queue',
      memberName: 'queue',
      group: 'musique',
      aliases: ['songs', 'song-list', 'list', 'listqueue'],
      description: 'Afficher la liste des musiques en cours',
      format: '[PageNumber]',
      examples: ['queue 2'],
      guildOnly: true,
      args: [
        {
          key: 'page',
          prompt: 'Quelle page voulez vous voir ?',
          type: 'integer',
          default: 1
        }
      ]
    });
  }

  run (msg, {page}) {
    const queue = this.queue.get(msg.guild.id);

    if (!queue) {
      return msg.reply('il n\'y a aucune musique dans la file d\'attente. Pourquoi ne pas y ajouter quelques titres? 😎');
    }

    const currentSong = queue.songs[0];
    const currentTime = currentSong.dispatcher ? currentSong.dispatcher.streamTime / 1000 : 0;
    const paginated = util.paginate(queue.songs, page, 10);
    const totalLength = queue.songs.reduce((prev, song) => prev + song.length, 0);

    return msg.embed({
      color: 0xcd6e57,
      title: `File d'attente (page ${paginated.page})`,
      author: {
        name: `${msg.author.tag}`,
        iconURL: msg.author.displayAvatarURL({format: 'png'})
      },
      description: stripIndents`
            ${paginated.items.map(song => `**-** ${!isNaN(song.id) ? `${song.name} (${song.lengthString})` : `[${song.name}](${`https://www.youtube.com/watch?v=${song.id}`})`} (${song.lengthString})`).join('\n')}
            ${paginated.maxPage > 1 ? `\nVeuillez utiliser ${msg.usage()} pour voir une page en particulier.\n` : ''}
            **En cours:** ${!isNaN(currentSong.id) ? `${currentSong.name}` : `[${currentSong.name}](${`https://www.youtube.com/watch?v=${currentSong.id}`})`}
            ${oneLine`
                **Progression:**
                ${!currentSong.playing ? 'En pause: ' : ''}${Song.timeString(currentTime)} /
                ${currentSong.lengthString}
                (${currentSong.timeLeft(currentTime)} restant)
            `}
            **Durée totale de la file d'attente:** ${Song.timeString(totalLength)}
        `
    });
  }

  get queue () {
    if (!this._queue) {
      this._queue = this.client.registry.resolveCommand('musique:play').queue;
    }

    return this._queue;
  }
};