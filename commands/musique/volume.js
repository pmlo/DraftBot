const {Command} = require('discord.js-commando');
const {roundNumber,deleteCommandMessages} = require('../../utils.js');

module.exports = class StopMusicCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'volume',
      memberName: 'volume',
      group: 'musique',
      aliases: ['set-volume', 'set-vol', 'vol'],
      examples: ['volume'],
      description: 'Changer le volume de la musique.',
      details: 'Le volume doit être entre 0 et 10.',
      guildOnly: true,
      args: [{
        key: 'volume',
        prompt: 'Quel volume souhaitez vous mettre',
        type: 'integer',
        max: 11,
        min: 0,
        default: -1,
      }]
    });
  }

  run (msg, args) {
    deleteCommandMessages(msg);
    const queue = this.queue.get(msg.guild.id);

    if (!queue) {
      return msg.reply('il n\'y a aucune musique en cours');
    }
    if (volume < 0) {
      return msg.reply(`Le volume est actuellement de ${queue.volume}.`);
    }
    if (!queue.voiceChannel.members.has(msg.author.id)) {
        return msg.reply('Vous n\'êtes pas dans le salon !');
    }

    queue.volume = volume;
    
    if (queue.songs[0].dispatcher) {
      queue.songs[0].dispatcher.setVolumeLogarithmic(queue.volume / 5);
    }

    return msg.reply(`Le volume est maintenant mis sur ${volume}.`);
  }

  get queue () {
    if (!this._queue) {
      this._queue = this.client.registry.resolveCommand('musique:play').queue;
    }

    return this._queue;
  }
};