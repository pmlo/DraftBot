const { CommandoClient, SQLiteProvider } = require('discord.js-commando'),
        path = require('path'),
        sqlite = require('sqlite'),
        {makeWelcomeImage,addDefaultRole} = require('./utils.js');

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
    addDefaultRole(member)
})


DraftBot.on('raw', event => {
    const { d: data } = event;
    if (event.t === 'MESSAGE_REACTION_ADD' || event.t == "MESSAGE_REACTION_REMOVE"){
        const channel = DraftBot.channels.get(event.d.channel_id);
        channel.messages.fetch(event.d.message_id).then(msg=> {
            let user = msg.guild.member(data.user_id);
            if (msg.author.id == DraftBot.user.id && msg.guild.settings.get(`react-${msg.id}:${data.emoji.id}`)){
                if (user.id != DraftBot.user.id){
                    const role = msg.guild.roles.find(r => r.id === msg.guild.settings.get(`react-${msg.id}:${data.emoji.id}`));
                    if (event.t === "MESSAGE_REACTION_ADD"){
                        user.roles.add(role);
                    } else {
                        user.roles.remove(role)
                    }
                }
            }
        })
    }   
});

DraftBot.registry
    .registerDefaultTypes()
    .registerGroups([
        ['bot', 'Bot - Informations par rapport au bot et au discord'],
        ['musique', 'Musique - Commandes permettant de mettre de la musique'],
        ['utils', 'Utils - Différents outils permettant différentes choses sur le serveur'],
        ['recherches', 'Recherches - Faites des recherches google à partir de discord'],
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