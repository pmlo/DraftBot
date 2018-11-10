const { CommandoClient, SQLiteProvider } = require('discord.js-commando');
const path = require('path');
const sqlite = require('sqlite');
const {makeWelcomeImage,newUser,guildAdd,sendSysLogs,invites,createTables,error} = require('./utils.js');
const websocket = require('./websocket');

require('dotenv').config();

const DraftBot = new CommandoClient({
    commandPrefix: '!',
    unknownCommandResponse: false,
    owner: '207190782673813504',
    disableEveryone: true
});

new websocket(process.env.token, 8000, DraftBot)

sqlite.open(path.join(__dirname, "./settings.sqlite")).then((db) => {
    DraftBot.setProvider(new SQLiteProvider(db));
});

DraftBot.on('ready', () => {
    console.log('DraftBot connecté !')
    console.log(`Actif sur ${DraftBot.guilds.size} serveurs.`);
    DraftBot.user.setActivity('ses lignes', {
        type: 'WATCHING'
    })
    createTables()
});

DraftBot.on('guildMemberAdd', member => {
    makeWelcomeImage(member);
    newUser(member, true)
})

DraftBot.on('guildMemberRemove', member => newUser(member, false))

DraftBot.on('roleCreate', role => sendSysLogs(role.guild,null, `Le role ${role.name} a été crée.`))

DraftBot.on('roleUpdate', (oldRole,newRole) => {
    if(oldRole != newRole){
        sendSysLogs(oldRole.guild,`Le role **${oldRole.name}** a été mis à jour.`,`
            ${oldRole.name !== newRole.name ? '- Le nom du role à été changé en '+newRole.name+'.\n':''}
            ${oldRole.hexColor  !== newRole.hexColor  ? '- La couleur du role à été changé en '+newRole.hexColor +'.\n':''}
            ${oldRole.hoist !== newRole.hoist ? (newRole.hoist === true ?'- Les membres ayant ce role seront affichés séparément des autres.':'- Les membres ayant ce role seront affichés dans la même temps.\n'):''}
            ${oldRole.mentionable !== newRole.mentionable ? (newRole.mentionable === true ?'- Le role sera maintenant mentionnable.\n':'- Le role ne sera plus mentionnable.\n'):''}
            ${oldRole.permissions !== newRole.permissions ? '- Les permissions du role ont été modifiés.':''}
        `)
    }
})

DraftBot.on('roleDelete', role => sendSysLogs(role.guild,`Le role ${role.name} a été supprimé.`,null))

DraftBot.on('emojiCreate', emoji => sendSysLogs(emoji.guild, `L'émoji ${emoji.name} a été crée.`,null))

DraftBot.on('emojiDelete', emoji => sendSysLogs(emoji.guild, `L'émoji ${emoji.name} a été supprimé.`,null))

DraftBot.on('guildCreate', guild => guildAdd(guild))

DraftBot.on('channelCreate', channel => {
    if(!channel.guild) return;
    sendSysLogs(channel.guild, `Le salon ${channel.name} a été crée.`,null)
})

DraftBot.on('channelDelete', channel => sendSysLogs(channel.guild, `Le salon ${channel.name} a été supprimé.`,null))

DraftBot.on('message', message => {
    if(!message.guild || message.author.bot) return;
    if (message.guild && message.guild.settings.get('invites') === false && invites(message, message.client)) message.delete();

    if(message.guild.settings.get('levelSystem') === false) return;
    //level system
    const xp = Math.floor(Math.random()*11)+15;
    const selectUser = connexion => {
        return connexion.get(`SELECT xp FROM "levels" WHERE user=${message.author.id} AND guild=${message.guild.id}`)
          .then(result => ({ connexion, result }))
    }
    return sqlite.open(path.join(__dirname, './storage.sqlite'))
    .then(selectUser)
    .then(({ connexion, result }) => {
      if (result) {
        return connexion.run(`UPDATE "levels" SET xp= ${Number(result.xp) + Number(xp)} WHERE user= ? AND guild= ?`, [message.author.id, message.guild.id])
      } else {
        return connexion.run(`INSERT INTO "levels" (guild, user, xp) VALUES (?, ?, ?)`,[message.guild.id, message.author.id, xp])
      }
    })
});

DraftBot.on('raw', event => {
    const { d: data } = event;
    if (event.t === 'MESSAGE_REACTION_ADD' || event.t == "MESSAGE_REACTION_REMOVE"){
        const channel = DraftBot.channels.get(event.d.channel_id);
        channel.messages.fetch(event.d.message_id).then(msg=> {
            if(msg.author.id === DraftBot.user.id){
                let user = msg.guild.member(data.user_id);

                const selectEmoji = connexion => {
                    return connexion.get(`SELECT role FROM "reacts" WHERE message='${msg.id}' AND emoji='${data.emoji.id||data.emoji.name}' AND guild='${msg.guild.id}'`)
                    .then(result => ({ connexion, result }))
                }
                sqlite.open(path.join(__dirname, './storage.sqlite'))
                .then(selectEmoji)
                .then(({ connexion, result }) => {
                    if(result && !user.bot){
                        const role = msg.guild.roles.find(r => r.id === result.role);
                        const testErr = err => {
                            if(err.message === 'Missing Permissions'){
                                return msg.channel.send(error(`Je n'ai pas la permission de modifier les roles d'une personne ayant une hiérachie plus élevé que la miene.`))
                            }
                        }
                        if (event.t === "MESSAGE_REACTION_ADD"){
                            user.roles.add(role).catch(testErr)
                        } else {
                            user.roles.remove(role).catch(testErr)
                        }
                    }
                })
            }
        }).catch(()=> null)
    }
});

DraftBot.on('unknownCommand', msg => {
    const {guild} = msg;
    msg.reply(`cette commande est inconnue !\nVeuillez utiliser \`${guild ? guild.commandPrefix : msg.client.commandPrefix}help\` ou ${DraftBot.user} help\npour afficher la liste des commandes disponibles.`)
})

DraftBot.registry
    .registerDefaultTypes()
    .registerGroups([
        ['bot', 'Bot - Informations par rapport au bot et au discord'],
        ['musique', 'Musique - Commandes permettant de mettre de la musique'],
        ['utils', 'Utils - Différents outils permettant différentes choses sur le serveur'],
        ['fun', 'Fun - Commandes fun'],
        ['levels', 'Levels - Consultez votre activité sur une guild'],
        ['moderation', 'Moderation - Commandes de modération'],
        ['admin', 'Admin - Commandes d\'administateur']
    ])
    .registerDefaultGroups()
    .registerDefaultCommands({
        help: true,
        prefix: true,
        ping: true,
        commandState: true
      })
    .registerCommandsIn(path.join(__dirname, 'commands'));

DraftBot.login(process.env.token);