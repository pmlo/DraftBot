const {Command} = require('discord.js-commando');
const {MessageEmbed} = require('discord.js');
const weather = require('weather-js');
const moment = require('moment');
moment.locale('fr');


module.exports = class WeatherCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'meteo',
            memberName: 'meteo',
            group: 'utils',
            aliases: ['meteo', 'météo', 'weather', 'temp'],
            description: 'Récupérer et afficher la météo d\'une ville',
            examples: ['meteo Montpellier'],
            guildOnly: false,
            args: [
                {
                    key: 'ville',
                    prompt: 'De quelle ville voulez-vous la météo?',
                    type: 'string',
                }
            ],
        });
    }

    run(msg, {ville}) {

        weather.find({search: ville, degreeType: 'C'}, function (err, result) {
            try {
                if (err) throw 'weather bug';
                if (result.length === 0) throw 'not found';
                
                const current = result[0].current;
                const forecast = result[0].forecast;

                const embed = new MessageEmbed()
                .setDescription(`🛰️ Prévisions du **${moment(current.date).format('dddd DD MMMM').replace(/(^.|[ ]+.)/g, c => c.toUpperCase())}**`)
                .setAuthor(`Méteo pour ${current.observationpoint}`)
                .setThumbnail(current.imageUrl)
                .setColor(0xcd6e57)
                .addField('☀️ Temps', `**${current.skytext}**`, true)
                .addField('🌡️ Température', `${current.temperature} °C`, true)
                .addField('🌡️ Ressenti', `${current.feelslike} °C`, true)
                .addField('💨 Vitesse du vent', current.winddisplay, true)
                .addField("💧 Taux d'humidité", `${current.humidity}%`, true)
                .addField(`🛰️ Prévisions du ${moment(forecast[2].date).format('dddd DD MMMM').replace(/(^.|[ ]+.)/g, c => c.toUpperCase())}`,
                    `Temps: ${forecast[2].skytextday} | Élevé: ${forecast[2].high} °C | Basse: ${forecast[2].low} °C | Précip: ${forecast[2].precip}%`, false)
                .addField(`🛰️ Prévisions du ${moment(forecast[3].date).format('dddd DD MMMM').replace(/(^.|[ ]+.)/g, c => c.toUpperCase())}`,
                    `Temps: ${forecast[3].skytextday} | Élevé: ${forecast[3].high} °C | Basse: ${forecast[3].low} °C | Précip: ${forecast[3].precip}%`, false)
                .addField(`🛰️ Prévisions du ${moment(forecast[4].date).format('dddd DD MMMM').replace(/(^.|[ ]+.)/g, c => c.toUpperCase())}`,
                    `Temps: ${forecast[4].skytextday} | Élevé: ${forecast[4].high} °C | Basse: ${forecast[4].low} °C | Précip: ${forecast[4].precip}%`, false);
                msg.embed(embed);
            } catch (e) {
                if(e === 'not found'){
                    return msg.channel.send(`Impossible de trouver la ville \`${ville}\` !`)
                }
                msg.channel.send("Une erreur est survenue, veuillez nous excusez.");
            }
        })
    }
};