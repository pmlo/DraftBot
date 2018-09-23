const {Command} = require('discord.js-commando');

module.exports = class ResumeSongCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'resume',
      memberName: 'resume',
      group: 'musique',
      aliases: ['go', 'continue', 'loss', 'res'],
      description: 'Resumes the currently playing song.',
      examples: ['resume'],
      guildOnly: true
    });
  }

  run (msg) {
    const queue = this.queue.get(msg.guild.id);

    if (!queue) {
      return msg.reply('there isn\'t any music playing to resume, oh brilliant one.');
    }
    if (!queue.songs[0].dispatcher) {
      return msg.reply('pretty sure a song that hasn\'t actually begun playing yet could be considered "resumed".');
    }
    if (queue.songs[0].playing) {
      return msg.reply('resuming a song that isn\'t paused is a great move. Really fantastic.');
    }
    queue.songs[0].dispatcher.resume();
    queue.songs[0].playing = true;

    return msg.reply('resumed the music. This party ain\'t over yet!');
  }

  get queue () {
    if (!this._queue) {
      this._queue = this.client.registry.resolveCommand('musique:play').queue;
    }

    return this._queue;
  }
};