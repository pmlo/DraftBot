const {Command} = require('discord.js-commando'), 
  {stripIndents} = require('common-tags'), 
  {Song} = require('../../utils.js');

module.exports = class MusicStatusCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'playlist',
      memberName: 'playlist',
      group: 'musique',
      description: 'Relancer la musique en cours.',
      aliases: ['startlist','play-list'],
      exemples: ['playlist <lien>'],
      guildOnly: true,
      args: [{
        key: 'argument',
        prompt: 'Que souhaitez vous faire ? \`add, ajouter\`, `lire, read, jouer`',
        type: 'integer',
        default: 1,
        min: 1,
        max: 10
      }]
    });
  }

  run (msg,{nombre}) {
    const queue = this.queue.get(msg.guild.id);

    if (!queue) {
      return msg.say('Il n\'y a aucune musique dans la file d\'attente. Pourquoi ne pas y ajouter quelques titres? 😎');
    }

    for (let i = 0; i < nombre; i++) {
      queue.songs.unshift(queue.songs[0]);
    }
    
    const song = queue.songs[0],
      embed = {
        color: 0xcd6e57,
        author: {
          name: `${song.username}`,
          iconURL: song.avatar
        },
        description: `👍 [${song}](${song.url}) ajouté ${nombre} ${nombre === 1 ? 'foi' : 'fois'}`
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