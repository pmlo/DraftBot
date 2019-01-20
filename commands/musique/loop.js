const {Command} = require('discord.js-commando');
const {deleteCommandMessages} = require('../../utils.js');

module.exports = class LoopSongCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'loop',
      memberName: 'loop',
      group: 'musique',
      aliases: ['boucle'],
      description: 'Permet de mettre en boucle une musique.',
      examples: ['loop'],
      guildOnly: true
    });
  }

  run (msg) {
    deleteCommandMessages(msg);
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
    if (queue.loop === true) {
      queue.loop = false;
      return msg.reply(`la boucle à maintenant été désactivé !`);
    }
    queue.loop = true;
    return msg.reply(`la boucle est maintenant lancé sur la musique [${queue.songs[0].title}](${queue.songs[0].url})`);
  }

  get queue () {
    if (!this._queue) {
      this._queue = this.client.registry.resolveCommand('musique:play').queue;
    }

    return this._queue;
  }
};