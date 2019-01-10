const {Command} = require('discord.js-commando');
const {MessageEmbed} = require('discord.js');
const Database = require('better-sqlite3');
const path = require('path');

module.exports = class WelcomeCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'reglement',
      memberName: 'reglement',
      group: 'admin',
      aliases: ['validator','valid-reglement'],
      description: 'Mettre en place un système de règlement avec validation',
      examples: ['reglement'],
      guildOnly: true,
      args: [{
        key: 'channel',
        prompt: 'Quel salon est destiné au règlement ?',
        type: 'channel'
      },
      {
        key: 'role',
        prompt: 'Quel role doit être ajouté lors de la validation du règlement ?',
        type: 'role'
      }],
      userPermissions: ['ADMINISTRATOR']
    });
  }

  async run (msg, {channel,role}) {
    const db = new Database(path.join(__dirname, '../../storage.sqlite'));
    const result = db.prepare(`SELECT * FROM "access" WHERE channel='${channel.id}' AND role='${role.id}' AND guild='${msg.guild.id}'`).get()

    if (result) return msg.reply('Un règlement est déjà disponible dans ce salon !')
  
    db.prepare(`INSERT INTO "access" (guild, channel, role) VALUES ($guild, $channel, $role)`).run({
      guild: msg.guild.id,
      channel: channel.id,
      role: role.id
    })

    const embed = new MessageEmbed()
    .setColor(0xcd6e57)
    .setTitle(`Acceptez le règlement de ${msg.guild.name} pour accéder à l'intégralité du serveur`)
    .setFooter(`Pour accpeter le règelement du serveur veuillez interagir avec la réaction ci-dessous !`)

    channel.send(embed).then(message => message.react('✅'))
  }
};