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
      return msg.reply('je ne joue pas de musique pour le moment, pourquoi ne pas commencer maintenant?');
    }
    if (!queue.songs[0].dispatcher) {
      return msg.reply('je ne peux pas mettre en pause une chanson qui n’a même pas encore été lancé.');
    }
    if (!queue.songs[0].playing) {
      return msg.reply('la réception est impossible 🤔');
    }
    queue.songs[0].dispatcher.pause();
    queue.songs[0].playing = false;

    return msg.reply(`la musique mise en pause. Utilisez \`${msg.guild.commandPrefix}resume\` pour relancer la musique.`);
  }

  get queue () {
    if (!this._queue) {
      this._queue = this.client.registry.resolveCommand('musique:play').queue;
    }

    return this._queue;
  }
};