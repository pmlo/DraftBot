const fetch = require('node-fetch');
const {Command} = require('discord.js-commando');
const {MessageEmbed} = require('discord.js');

module.exports = class StrawpollCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'strawpoll',
      memberName: 'strawpoll',
      group: 'utils',
      aliases: ['straw', 'poll'],
      description: 'Créer un sondage Strawpoll.',
      format: '\'Title Of Strawpoll\' OptionA OptionB OptionC...',
      examples: ['strawpoll \'Quel est le meilleur langage ?\' \'JavaScript\' \'Ruby\' \'C#\''],
      guildOnly: false,
      args: [
        {
          key: 'title',
          prompt: 'Titre du strawpoll',
          type: 'string'
        },
        {
          key: 'options',
          prompt: 'Quelles sont les options du strawpoll (au minimum 2)? Envoyez une option par message et terminez par `finish`',
          type: 'string',
          infinite: true
        }
      ]
    });
  }

  async run (msg, {title, options}) {
    if (options.length < 2) {
      return msg.reply('un sondage doit avoir au moins 2 réponses');
    }
    try {
      const pollPost = await fetch('https://www.strawpoll.me/api/v2/polls', {
          method: 'POST',
          body: JSON.stringify({
            title,
            options,
            multi: false,
            dupcheck: 'normal',
            captcha: true
          }),
          headers: {'Content-Type': 'application/json'}
        }),
        strawpoll = await pollPost.json();

        const pollEmbed = new MessageEmbed()
        .setColor(0xcd6e57)
        .setTitle(strawpoll.title)
        .setURL(`http://www.strawpoll.me/${strawpoll.id}`)
        .setImage(`http://www.strawpoll.me/images/poll-results/${strawpoll.id}.png`)
        .setDescription(`Options pour ce sondage: ${strawpoll.options.map(val => `\`${val}\``).join(', ')}`);

      return msg.embed(pollEmbed, `http://www.strawpoll.me/${strawpoll.id}`);
    } catch (err) {
      return msg.reply('une erreur s\'est produite lors de la création du strawpoll');
    }
  }
};