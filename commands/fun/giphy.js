const {Command} = require('discord.js-commando');
const {MessageEmbed} = require('discord.js');
const {get} = require('snekfetch');

module.exports = class AvatarCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'giphy',
      memberName: 'giphy',
      group: 'fun',
      aliases: ['giphy','gif','rangif'],
      description: 'Permet d\'envoyer un meme.',
      examples: ['giphy'],
      args: [
        {
          key: 'search',
          prompt: 'Quelle recherche voulez vous ?',
          type: 'string',
          default: ''
        }
      ]
    });
  }

  async run (msg, {search}) {

    msg.delete()
    let getter;
    if(search){
      const newSearch = search.split(' ').filter(val => val !== '').join('+');
      getter = `https://api.giphy.com/v1/gifs/search?q=${newSearch}&api_key=${process.env.giphy_key}&limit=1`
    }else{
      getter = `https://api.giphy.com/v1/gifs/random?api_key=${process.env.giphy_key}`
    }
    const result = await get(getter)
    const gif = result.body.data.images.original.url;
    const embed = new MessageEmbed()
    .setColor('#cd6e57')
    .setImage(gif)
    .setAuthor(msg.author.username, msg.author.displayAvatarURL())
    .setURL(gif)
    .setDescription(`[Lien direct](${gif})`);

    return msg.embed(embed);
  }
};