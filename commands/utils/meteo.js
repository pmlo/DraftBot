const fetch = require('node-fetch');
const moment = require('moment');
moment.locale('fr');
const querystring = require('querystring');
const {Command} = require('discord.js-commando');
const {MessageEmbed} = require('discord.js');

module.exports = class WeatherCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'meteo',
      memberName: 'meteo',
      group: 'utils',
      aliases: ['meteo','météo', 'weather', 'temp'],
      description: 'Récupérer la météo d\'une ville',
      examples: ['meteo Montpellier'],
      guildOnly: false,
      args: [
        {
          key: 'location',
          prompt: 'Pour quelle localisation voulez vous la météo ?',
          type: 'string'
        }
      ]
    });
  }

  async getLocs (location) {
    const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?${querystring.stringify({
        address: location,
        key: process.env.google_api
      })}`);
    const cords = await res.json();
console.log(cords)
    return {
      lat: cords.results[0].geometry.location.lat,
      long: cords.results[0].geometry.location.lng,
      address: cords.results[0].formatted_address
    };
  }

  fahrenify (temp) {
    return temp * 1.8 + 32;
  }

  async run (msg, {location}) {
    try {
      const cords = await this.getLocs(location);

      const res = await fetch(`https://api.darksky.net/forecast/${process.env.meteo_api}/${cords.lat},${cords.long}?${querystring.stringify({
          exclude: ['minutely', 'hourly', 'alerts', 'flags'],
          units: 'si'
      })}`)

      const weather = await res.json()

      const weatherEmbed = new MessageEmbed()
        .setTitle(`Météo pour **${cords.address}**`)
        .setColor(0xcd6e57)
        .setTimestamp()
        .setThumbnail(`https://www.draftman.fr/images/draftbot/meteo/${weather.currently.icon}.png`)
        .addField('💨 Vitesse du vent', `${weather.currently.windSpeed} km/h`, true)
        .addField('💧 Humidité', `${weather.currently.humidity * 100}%`, true)
        .addField('🌅 Lever du soleil', moment(weather.daily.data[0].sunriseTime * 1000).format('HH:mm'), true)
        .addField('🌇 Coucher du soleil', moment(weather.daily.data[0].sunsetTime * 1000).format('HH:mm'), true)
        .addField('☀️ Température la plus haute', `${weather.daily.data[0].temperatureHigh} °C`, true)
        .addField('☁️️ Température la plus basse', `${weather.daily.data[0].temperatureLow} °C`, true)
        .addField('🌡️ Température', `${weather.currently.temperature} °C`, true)
        .addField('🌡️ Température ressenti', `${weather.currently.apparentTemperature} °C`, true)
        .addField(`🛰️ Prévisions de ${moment.unix(weather.daily.data[1].time).format('dddd DD MMMM').replace(/(^.|[ ]+.)/g, c => c.toUpperCase())}`,
          `Élevé: ${weather.daily.data[1].temperatureHigh} °C | Basse: ${weather.daily.data[1].temperatureLow} °C`, false)
        .addField(`🛰️ Prévisions de ${moment.unix(weather.daily.data[2].time).format('dddd DD MMMM').replace(/(^.|[ ]+.)/g, c => c.toUpperCase())}`,
          `Élevé: ${weather.daily.data[2].temperatureHigh} °C | Basse: ${weather.daily.data[2].temperatureLow} °C`, false);

      return msg.embed(weatherEmbed);
    } catch (err) {
      console.log(err)
      return msg.reply(`impossible de trouver la météo pour \`${location}\`\nEn attente d'une autre api que google geocode!`);
    }
  }
};