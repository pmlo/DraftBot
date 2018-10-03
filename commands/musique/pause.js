const {Command} = require('discord.js-commando');

module.exports = class PauseSongCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'pause',
      memberName: 'pause',
      group: 'musique',
      aliases: ['shh', 'ho', 'tg', 'halt'],
      description: 'Permet de mettre en pause une musique.',
      examples: ['pause'],
      guildOnly: true
    });
  }

  run (msg) {
    const queue = this.queue.get(msg.guild.id);

    if (!queue) {
      return msg.reply('I am not playing any music right now, why not get me to start something?');
    }
    if (!queue.songs[0].dispatcher) {
      return msg.reply('I can\'t pause a song that hasn\'t even begun playing yet.');
    }
    if (!queue.songs[0].playing) {
      return msg.reply('pauseception is not possible 🤔');
    }
    queue.songs[0].dispatcher.pause();
    queue.songs[0].playing = false;

    return msg.reply(`paused the music. Use \`${msg.guild.commandPrefix}resume\` to continue playing.`);
  }

  get queue () {
    if (!this._queue) {
      this._queue = this.client.registry.resolveCommand('musique:play').queue;
    }

    return this._queue;
  }
};