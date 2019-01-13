const {Command} = require('discord.js-commando');
const {MessageEmbed} = require('discord.js');
const Database = require('better-sqlite3');
const path = require('path');
const {deleteCommandMessages} = require('../../utils.js');

module.exports = class WelcomeCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'reglement',
      memberName: 'reglement',
      group: 'configuration',
      aliases: ['validator','valid-reglement'],
      description: 'Mettre en place un système de règlement avec validation',
      examples: ['reglement'],
      guildOnly: true,
      args: [{
        key: 'role',
        prompt: 'Quel role doit être ajouté lors de la validation du règlement ?',
        type: 'role'
      }],
      userPermissions: ['ADMINISTRATOR']
    });
  }

  async run (msg, {role}) {
    deleteCommandMessages(msg);
    const db = new Database(path.join(__dirname, '../../storage.sqlite'));
  
    const embed = new MessageEmbed()
    .setColor(0xcd6e57)
    .setTitle(`Acceptez le règlement de ${msg.guild.name} pour accéder à l'intégralité du serveur`)
    .setFooter(`Pour accpeter le règelement du serveur veuillez interagir avec la réaction ci-dessous !`)

    msg.channel.send(embed).then(message => {
      message.react('✅');
      db.prepare(`INSERT INTO "access" (guild, message, role) VALUES ($guild, $message, $role)`).run({
        guild: msg.guild.id,
        message: message.id,
        role: role.id
      });
    })
  }
};