const {Command} = require('discord.js-commando')

module.exports = class MusicStatusCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'duplique',
      memberName: 'duplique',
      group: 'musique',
      aliases: ['encore','duplicate','repeat'],
      description: 'Relancer la musique en cours.',
      examples: ['duplique'],
      guildOnly: true,
      args: [{
        key: 'nombre',
        prompt: 'Combien de fois souhaitez vous dupliquer la musique en cours ?',
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