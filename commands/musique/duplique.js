const {Command} = require('discord.js-commando'), 
  {stripIndents} = require('common-tags'), 
  {Song} = require('../../utils.js');

module.exports = class MusicStatusCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'duplique',
      memberName: 'duplique',
      group: 'musique',
      aliases: ['encore','duplicate','repeat'],
      description: 'Relancer la musique en cours.',
      guildOnly: true
    });
  }

  run (msg) {
    const queue = this.queue.get(msg.guild.id);

    queue.songs.unshift(songs[0]);

    if (!queue) {
      return msg.say('Il n\'y a aucune musique dans la file d\'attente. Pourquoi ne pas y ajouter quelques titres? 😎');
    }
    
    const song = queue.songs[0], // eslint-disable-line one-var
      embed = {
        color: 0xcd6e57,
        author: {
          name: `${song.username}`,
          iconURL: song.avatar
        },
        description: stripIndents`
				[${song}](${`${song.url}`})
				La musique a bien été dupliqué !
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