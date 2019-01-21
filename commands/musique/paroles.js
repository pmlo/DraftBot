const {Command} = require('discord.js-commando');
const music = require('musicmatch')({apikey:process.env.musicmatch_api});
const {MessageEmbed} = require('discord.js');
const {deleteCommandMessages} = require('../../utils.js');

module.exports = class ResumeSongCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'paroles',
      memberName: 'paroles',
      group: 'musique',
      aliases: ['musicmatch', 'lyrics'],
      description: 'Permet de récupérer les paroles d\'une chanson.',
      examples: ['paroles Faded Alan Walker'],
      args: [{
        key: 'recherche',
        prompt: 'Quelle musique souhaitez vous chercher dans le répertoire des paroles',
        type: 'string'
      }]
    });
  }

  async run (msg, {recherche}) {
    deleteCommandMessages(msg);

    const search = await music.trackSearch({q:recherche,page_size:1,s_track_rating:'desc'})
    const {track_name, track_id, artist_name,artist_id,album_name,album_id,track_share_url} = search.message.body.track_list[0].track;

    const lyrics = await music.trackLyrics({track_id:track_id})
    const paroles = lyrics.message.body.lyrics.lyrics_body;

    const embed = new MessageEmbed()
    .setColor(0xcd6e57)
    .setTitle(`Paroles de la musique ${track_name} de ${artist_name}`)
    .setURL(track_share_url)
    .setAuthor(msg.author.tag, msg.author.displayAvatarURL({format: 'png'}))
    .setDescription(`${paroles.slice(0, paroles.length - 71)} \n\nLa suite [[ici]](${track_share_url})`)
    .addField('Informations:',`Album: ${album_name}\nArtiste: ${artist_name}`)
    .setFooter(msg.guild ? msg.guild.name : '',msg.guild ? msg.guild.iconURL({format: 'png'}) : msg.client.user.avatarURL({format: 'png'}))
    .setTimestamp()

    msg.embed(embed);
  }
};

//?paroles Alan Walker - Faded