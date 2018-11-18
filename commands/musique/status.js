const {Command} = require('discord.js-commando'), 
  {stripIndents} = require('common-tags'), 
  {Song} = require('../../utils.js');

module.exports = class MusicStatusCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'status',
      memberName: 'status',
      group: 'musique',
      examples: ['status'],
      aliases: ['song', 'playing', 'current-song', 'now-playing', 'current'],
      description: 'Afficher le status de la musique en cours.',
      guildOnly: true
    });
  }

  run (msg) {
    const queue = this.queue.get(msg.guild.id);

    if (!queue) {
      return msg.say('Il n\'y a aucune musique dans la file d\'attente. Pourquoi ne pas y ajouter quelques titres? 😎');
    }
    const song = queue.songs[0], // eslint-disable-line one-var
      currentTime = song.dispatcher ? song.dispatcher.streamTime / 1000 : 0,
      embed = {
        color: 0xcd6e57,
        author: {
          name: `${song.username}`,
          iconURL: song.avatar
        },
        description: stripIndents`
				[${song}](${`${song.url}`})
				On est à ${Song.timeString(currentTime)}, il reste ${song.timeLeft(currentTime)} de la musique.
				${!song.playing ? 'La musique est en pause.' : ''}
			`,
        image: {url: song.thumbnail}
      };

    return msg.embed(embed);
  }

  get queue () {
    if (!this._queue) {
      this._queue = this.client.registry.resolveCommand('musique:play').queue;
    }

    return this._queue;
  }
};