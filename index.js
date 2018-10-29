const { CommandoClient, SQLiteProvider } = require('discord.js-commando');
const path = require('path');
const sqlite = require('sqlite');
const { stripIndents } = require('common-tags')
const {makeWelcomeImage,newUser,guildAdd,sendSysLogs,invites} = require('./utils.js');
const websocket = require('./websocket');

require('dotenv').config();

const DraftBot = new CommandoClient({
    commandPrefix: '!',
    unknownCommandResponse: false,
    owner: '207190782673813504',
    invite: 'https://www.draftman.fr/discord',
    disableEveryone: true
});

new websocket(process.env.token, 8000, DraftBot)

sqlite.open(path.join(__dirname, "./databases/settings.sqlite")).then((db) => {
    DraftBot.setProvider(new SQLiteProvider(db));
});

DraftBot.on('ready', () => {
    console.log('DraftBot connecté !')
    console.log(`Actif sur ${DraftBot.guilds.size} serveurs.`);
    DraftBot.user.setActivity('ses lignes', {
        type: 'WATCHING'
    })
});

DraftBot.on('guildMemberAdd', member => {
    makeWelcomeImage(member);
    newUser(member, true)
})

DraftBot.on('guildMemberRemove', member => newUser(member, false))

DraftBot.on('roleCreate', role => sendSysLogs(role.guild,null, `Le role ${role.name} a été crée.`))

DraftBot.on('roleUpdate', (oldRole,newRole) => {
    if(oldRole !== newRole){
        sendSysLogs(oldRole.guild,`Le role **${oldRole.name}** a été mis à jour.`, stripIndents`
            ${oldRole.name !== newRole.name ? '- Le nom du role à été changé en '+newRole.name+'.':''}
            ${oldRole.hexColor  !== newRole.hexColor  ? '- La couleur du role à été changé en '+newRole.hexColor +'.':''}
            ${oldRole.hoist !== newRole.hoist ? (newRole.hoist === true ?'- Les membres ayant ce role seront affichés séparément des autres.':'- Les membres ayant ce role seront affichés dans la même temps.'):''}
            ${oldRole.mentionable !== newRole.mentionable ? (newRole.mentionable === true ?'- Le role sera maintenant mentionnable.':'- Le role ne sera plus mentionnable.'):''}
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
    if(!message.guild) return;
    if (message.guild && message.guild.settings.get('invites', false) && invites(message, message.client)) message.delete();

    //level system
    const xp = Math.floor(Math.random()*11)+15;

    //ouverture de la bdd
    const testdb = sqlite.open(path.join(__dirname, "./databases/levels.sqlite"))
    sqlite.open(path.join(__dirname, "./databases/settings.sqlite")).then((db) => {
        db.run(`CREATE TABLE IF NOT EXISTS "${message.guild.id}"(user TEXT, level TEXT, xp TEXT)`)
    });
    //création de la table guild
    // const test = testdb.prepare(`CREATE TABLE IF NOT EXISTS "${message.guild.id}"(user TEXT, level TEXT, xp TEXT)`).run()
    // console.log(test,testdb)

    //est ce que la ligne existe pour l'user ?

    // si elle existe on update

    //sinon on l'insert

    // sqlite.open(path.join(__dirname, "./databases/levels.sqlite")).then((db) => {
    //     db.run(`CREATE TABLE IF NOT EXISTS "${message.guild.id}"(user TEXT, level TEXT, xp TEXT)`)
    // }
    // db.serialize(() => {
    //   db.run(`CREATE TABLE IF NOT EXISTS "${message.guild.id}"(user TEXT, level TEXT, xp TEXT)`)
    //     .run(`INSERT INTO "${msg.guild.id}"(user, reason, date, mod) VALUES (?, ?, ?, ?)`,[
    //       member.id,
    //       reason !== '' ? reason : 'Aucune raison n\'a été spécifié par le modérateur',
    //       new Date(),
    //       msg.member.id
    //     ])
    //     .each(`SELECT count('user') AS 'count' FROM "${msg.guild.id}" WHERE user = ?`,[member.id],(err, {count}) => {
    //       const embed = new MessageEmbed()
    //       .setColor(0xcd6e57)
    //       .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
    //       .setDescription(stripIndents`
    //         **Membre:** ${member.user.tag}
    //         **Action:** Avertissement
    //         **Avertissements:** \`${count-1}\` => \`${count}\`
    //         **Raison:** ${reason !== '' ? reason : 'Aucune raison n\'a été spécifié par le modérateur'}`)
    //       .setTimestamp();
    //       return msg.embed(embed);
    //     })
    // })
});

DraftBot.on('raw', event => {
    const { d: data } = event;
    if (event.t === 'MESSAGE_REACTION_ADD' || event.t == "MESSAGE_REACTION_REMOVE"){
        const channel = DraftBot.channels.get(event.d.channel_id);
        channel.messages.fetch(event.d.message_id).then(msg=> {
            if(msg.author.id === DraftBot.user.id){
                let user = msg.guild.member(data.user_id);
                if (msg.guild.settings.get(`react-${msg.id}:${data.emoji.id||data.emoji.name}`)){
                    if (user.id != DraftBot.user.id){
                        const role = msg.guild.roles.find(r => r.id === msg.guild.settings.get(`react-${msg.id}:${data.emoji.id||data.emoji.name}`));
                        if (event.t === "MESSAGE_REACTION_ADD"){
                            user.roles.add(role);
                        } else {
                            user.roles.remove(role)
                        }
                    }
                }
            }
        }).catch(()=> null)
    }
});

DraftBot.on('unknownCommand', msg => {
    const {guild} = msg;
    msg.reply(`cette commande est inconnu !\nVeuillez utiliser \`${guild ? guild.commandPrefix : msg.client.commandPrefix}help\` ou ${DraftBot.user} help\npour afficher la liste des commandes disponibles.`)
})

DraftBot.registry
    .registerDefaultTypes()
    .registerGroups([
        ['bot', 'Bot - Informations par rapport au bot et au discord'],
        ['musique', 'Musique - Commandes permettant de mettre de la musique'],
        ['utils', 'Utils - Différents outils permettant différentes choses sur le serveur'],
        ['fun', 'Fun - Commandes fun'],
        ['leaderboards', 'Leaderboards - Regardez vos statistiques de différents jeux'],
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