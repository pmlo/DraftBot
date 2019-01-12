const { CommandoClient, SyncSQLiteProvider } = require('discord.js-commando');
const path = require('path');
const {makeWelcomeImage,newUser,guildAdd,sendLogsServ,invites,createTables,error,getLevelFromXp,getLastUserReward} = require('./utils.js');
const websocket = require('./websocket');
const {oneLine} = require('common-tags');
const Database = require('better-sqlite3');

require('dotenv').config();

const DraftBot = new CommandoClient({
    commandPrefix: '!',
    unknownCommandResponse: false,
    owner: '207190782673813504',
    disableEveryone: true
});

new websocket(process.env.token, 8000, DraftBot)

const settings = new Database(path.join(__dirname, './settings.sqlite'));
const db = new Database(path.join(__dirname, './storage.sqlite'));
DraftBot.setProvider(new SyncSQLiteProvider(settings));

DraftBot.on('ready', () => {
    console.log('DraftBot connecté !')
    console.log(`Actif sur ${DraftBot.guilds.size} serveurs.`);
    DraftBot.user.setActivity('ses lignes', {type: 'WATCHING'})
    createTables()
});

DraftBot.on('error', console.error);

DraftBot.on('guildMemberAdd', member => {
    makeWelcomeImage(member);
    newUser(member, true)
})

DraftBot.on('guildMemberRemove', member => newUser(member, false))

DraftBot.on('roleUpdate', (oldRole,newRole) => {
    if(oldRole.name === 'new role') {
        sendLogsServ(oldRole.guild,`Le role **${newRole.name}** a été crée.`,oneLine`
            ${oldRole.hexColor  !== newRole.hexColor  ? '- La couleur du role à été défini sur \`'+newRole.hexColor +'\`.\n':''}
            ${oldRole.hoist !== newRole.hoist ? (newRole.hoist === true ?'- Les membres ayant ce role seront affichés séparément des autres.':'- Les membres ayant ce role seront affichés dans la même temps.\n'):''}
            ${oldRole.mentionable !== newRole.mentionable ? (newRole.mentionable === true ?'- Le role sera mentionnable.\n':'- Le role ne sera pas mentionnable.\n'):''}
            ${oldRole.permissions.bitfield !== newRole.permissions.bitfield ? '- Les permissions du role ont été redéfinis.':''}
        `)
    } else if(oldRole.name != newRole.name || oldRole.hexColor  != newRole.hexColor || oldRole.hoist != newRole.hoist || oldRole.mentionable != newRole.mentionable || oldRole.permissions.bitfield !== newRole.permissions.bitfield){
        sendLogsServ(oldRole.guild,`Le role **${oldRole.name}** a été mis à jour.`,oneLine`
            ${oldRole.name !== newRole.name ? '- Le nom du role à été changé en \`'+newRole.name+'\`.\n':''}
            ${oldRole.hexColor  !== newRole.hexColor  ? '- La couleur du role à été changé en \`'+newRole.hexColor +'\`.\n':''}
            ${oldRole.hoist !== newRole.hoist ? (newRole.hoist === true ?'- Les membres ayant ce role seront affichés séparément des autres.':'- Les membres ayant ce role seront affichés dans la même temps.\n'):''}
            ${oldRole.mentionable !== newRole.mentionable ? (newRole.mentionable === true ?'- Le role sera maintenant mentionnable.\n':'- Le role ne sera plus mentionnable.\n'):''}
            ${oldRole.permissions.bitfield !== newRole.permissions.bitfield ? '- Les permissions du role ont été modifiés.':''}
        `)
    }
})

DraftBot.on('roleDelete', role => sendLogsServ(role.guild,`Le role ${role.name} a été supprimé.`,null))

DraftBot.on('emojiCreate', emoji => sendLogsServ(emoji.guild, `L'émoji ${emoji.name} a été crée.`,null))

DraftBot.on('emojiDelete', emoji => sendLogsServ(emoji.guild, `L'émoji ${emoji.name} a été supprimé.`,null))

DraftBot.on('guildCreate', guild => guildAdd(guild))

DraftBot.on('channelCreate', channel => {
    if(!channel.guild) return;
    sendLogsServ(channel.guild, `Le salon ${channel.name} a été crée.`,null)
})

DraftBot.on('channelDelete', channel => sendLogsServ(channel.guild, `Le salon ${channel.name} a été supprimé.`,null))

DraftBot.on('message', message => {
    if(!message.guild || message.author.bot) return;
    if (message.guild && message.guild.settings.get('invites') === false && invites(message, message.client)) message.delete();

    if(message.guild.settings.get('levelSystem') === false) return;

    const xp = Math.floor(Math.random()*11)+15;

    const result = db.prepare(`SELECT xp FROM "levels" WHERE user=${message.author.id} AND guild=${message.guild.id}`).get()

    if (result) {
        const level = getLevelFromXp(Number(result.xp) + Number(xp))
        getLastUserReward(message.guild,level).then(response => {
            if(response !== undefined){
                const member = message.guild.member(message.author)
                const role = message.guild.roles.get(response.role)
                if(!member.roles.find(r => r.id === response.role)) {
                    member.roles.add(role).catch(error => {
                        if(error.message === 'Missing Permissions'){
                            message.reply('Il y a un problème de permissions !')
                        }
                    }).then(() =>  message.reply(`Félicitation ! :tada:\nVous venez recevoir votre récompense car vous avez atteint le **niveau ${level}** !\nVous avez reçu le role **${role.name}** !`,{
                        files: ['https://www.draftman.fr/images/draftbot/felicitation.jpg']
                    }))
                }
            }
        })
        
        return db.prepare(`UPDATE "levels" SET xp= ${Number(result.xp) + Number(xp)} WHERE user= $user AND guild= $guild`).run({
            user: message.author.id, 
            guild: message.guild.id
        })
    } else {
        return db.prepare(`INSERT INTO "levels" (guild, user, xp) VALUES ($guild, $user, $xp)`).run({
            guild: message.guild.id, 
            user: message.author.id, 
            xp
        })
    }
});

DraftBot.on('raw', event => {
    const { d: data } = event;
    if (event.t === 'MESSAGE_REACTION_ADD' || event.t == "MESSAGE_REACTION_REMOVE"){
        const channel = DraftBot.channels.get(event.d.channel_id);
        channel.messages.fetch(event.d.message_id).then(msg=> {
            if(msg.author.id === DraftBot.user.id){
                let user = msg.guild.member(data.user_id);

                const roleReact = db.prepare(`SELECT role FROM "reacts" WHERE message='${msg.id}' AND emoji='${data.emoji.id||data.emoji.name}' AND guild='${msg.guild.id}'`).get()
                const access = db.prepare(`SELECT role FROM "access" WHERE message='${msg.id}' AND guild='${msg.guild.id}'`).get()

                const testErr = err => {
                    if(err.message === 'Missing Permissions'){
                        return msg.channel.send(error(`Je n'ai pas la permission de modifier vos roles.`))
                    }
                }

                if(roleReact && !user.bot){
                    const role = msg.guild.roles.find(r => r.id === roleReact.role);

                    if (event.t === "MESSAGE_REACTION_ADD"){
                        user.roles.add(role).catch(testErr)
                    } else {
                        user.roles.remove(role).catch(testErr)
                    }
                }
                if(access && !user.bot && data.emoji.name === '✅' && msg.embeds[0].title.startsWith('Acceptez')){
                    const role = msg.guild.roles.find(r => r.id === access.role);
                    
                    if (event.t === "MESSAGE_REACTION_ADD"){
                        user.roles.add(role).catch(testErr)
                    } else {
                        user.roles.remove(role).catch(testErr)
                    }
                }
            }
        }).catch(console.log)
    }
});

DraftBot.registry
    .registerDefaultTypes()
    .registerGroups([
        ['bot', 'Bot - Informations par rapport au bot et au discord'],
        ['musique', 'Musique - Commandes permettant de mettre de la musique'],
        ['utils', 'Utils - Différents outils permettant différentes choses sur le serveur'],
        ['fun', 'Fun - Commandes fun'],
        ['levels', 'Levels - Consultez votre activité sur une guild'],
        ['leadersboards','Leadersboards - Consultez les statistiques de vos jeux préférés'],
        ['dev', 'Développeurs - Outils pour développeurs'],
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