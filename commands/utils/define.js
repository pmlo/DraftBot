const { MessageEmbed } = require('discord.js');
const { Command } = require('discord.js-commando');
const fetch = ('node-fetch');

const { stringify } =  require('../../utils.js');

export default class DefineCommand extends Command {
    constructor(client) {   
        super(client, {
            name: 'define',
            aliases: ['def', 'dict','définition','deff','explique'],
            group: 'utils',
            memberName: 'define',
            description: 'Avoir la définition d\'un mot ou expression',
            examples: ['define pixel'],
            args: [
                {
                    key: 'query',
                    prompt: 'Quel mot ou expression souhaitez vous voir ?',
                    type: 'string',
                    parse: p => p.replace(/[^a-zA-Z]/g, '')
                }
            ]
        });
    }

    async run(msg, { query }) {
        try {
            const res = await fetch(
                `https://glosbe.com/gapi/translate?${stringify({
                    dest: 'fr',
                    format: 'json',
                    from: 'fr',
                    phrase: query,
                })}`
                
            );

            const words = await res.json();
            const final = [`**Definition de __${query}__:**`];

            for (let [index, item] of Object.entries(
                words.tuc
                    .filter(tuc => tuc.meanings)[0]
                    .meanings.slice(0, 5)
            )) {
                item = item.text
                    .replace(/\[(\w+)[^\]]*](.*?)\[\/\1]/g, '_')
                    .replace(/&quot;/g, '"')
                    .replace(/&#39;/g, "'")
                    .replace(/<b>/g, '[')
                    .replace(/<\/b>/g, ']')
                    .replace(/<i>|<\/i>/g, '_');
                final.push(`**${Number(index) + 1}:** ${item}`);
            }

            const defineEmbed = new MessageEmbed()
            .setColor(0xcd6e57)
            .setDescription(final)
            .setFooter(msg.guild ? msg.guild.name : '',msg.guild ? msg.guild.iconURL({format: 'png'}) : msg.client.user.avatarURL({format: 'png'}))
            .setTimestamp();

            return msg.embed(defineEmbed);
        } catch (err) {
            return msg.reply(`Aucuns résultats pour \`${query}\`!`);
        }
    }
}