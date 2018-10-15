const { CommandoClient, SQLiteProvider } = require('discord.js-commando');
const path = require('path');
const sqlite = require('sqlite');
const { stripIndents } = require('common-tags')
const {makeWelcomeImage,newUser,guildAdd,sendSysLogs} = require('./utils.js');

require('dotenv').config();

const DraftBot = new CommandoClient({
    commandPrefix: '!',
    unknownCommandResponse: false,
    owner: '207190782673813504',
    invite: 'https://www.draftman.fr/discord',
    disableEveryone: true
}); 

sqlite.open(path.join(__dirname, "settings.sqlite")).then((db) => {
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

DraftBot.on('channelCreate', channel => sendSysLogs(channel.guild, `Le salon ${channel.name} a été crée.`,null))

DraftBot.on('channelDelete', channel => sendSysLogs(channel.guild, `Le salon ${channel.name} a été supprimé.`,null))

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