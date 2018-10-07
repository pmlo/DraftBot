const {Command} = require('discord.js-commando');

module.exports = class ResumeSongCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'resume',
      memberName: 'resume',
      group: 'musique',
      aliases: ['go', 'continue', 'loss', 'res'],
      description: 'Permet de relancer une musique mise en pause.',
      examples: ['resume'],
      guildOnly: true
    });
  }

  run (msg) {
    const queue = this.queue.get(msg.guild.id);

    if (!queue) {
      return msg.reply('impossible de relancer la musique, il n\'y a pas de musique en cours de lecture.');
    }
    if (!queue.songs[0].dispatcher) {
      return msg.reply('je suis presque certain qu\'une chanson qui n\'a pas encore été jouée peut être considérée comme "reprise". 😉');
    }
    if (queue.songs[0].playing) {
      return msg.reply('reprendre une musique qui ne soit pas en pause est une très bonne idée. Vraiment fantastique. 🤔');
    }
    queue.songs[0].dispatcher.resume();
    queue.songs[0].playing = true;

    return msg.reply('musique relancé ! La fête n\'est pas encore terminée! 🎉');
  }

  get queue () {
    if (!this._queue) {
      this._queue = this.client.registry.resolveCommand('musique:play').queue;
    }

    return this._queue;
  }
};