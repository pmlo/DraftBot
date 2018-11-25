const {Command} = require('discord.js-commando');
const Fuse = require('fuse.js');
const {MessageEmbed} = require('discord.js');
const toMarkdown = require("to-markdown");
const fetch = require('node-fetch');
const {JSDOM} = require("jsdom");

//getSimilarObjects

module.exports = class DdocsCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'nodejs',
      memberName: 'nodejs',
      group: 'dev',
      aliases: ['node'],
      description: 'Afficher la documentation de NodeJs',
      examples: ['nodejs addEventListener'],
      args: [
        {
          key: 'query',
          prompt: 'Que souhaitez vous trouver ?\n',
          type: 'string',
          parse: p => p.replace(/\.prototype\./g, " ").replace(/\./g, " ")
        },
        {
          key: 'version',
          prompt: 'Quelle version de la documentation voulez vous (`v4`, `v5`, `v6`, `v7`, `v8`, `v9`, `v10`, `v11`)?',
          type: 'string',
          parse: value => value.toLowerCase(),
          validate: value => ['v4', 'v5', 'v6', 'v7', 'v8', 'v9', 'v10', 'v11'].includes(value),
          default: 'v11'
        }
      ]
    });

    this.docs = {};

    this.sources = [
      `https://nodejs.org/api/assert.json`,
      `https://nodejs.org/api/buffer.json`,
      `https://nodejs.org/api/addons.json`,
      `https://nodejs.org/api/child_process.json`,
      `https://nodejs.org/api/cluster.json`,
      `https://nodejs.org/api/cli.json`,
      `https://nodejs.org/api/console.json`,
      `https://nodejs.org/api/crypto.json`,
      `https://nodejs.org/api/debugger.json`,
      `https://nodejs.org/api/dns.json`,
      `https://nodejs.org/api/domain.json`,
      `https://nodejs.org/api/errors.json`,
      `https://nodejs.org/api/events.json`,
      `https://nodejs.org/api/fs.json`,
      `https://nodejs.org/api/globals.json`,
      `https://nodejs.org/api/http.json`,
      `https://nodejs.org/api/https.json`,
      `https://nodejs.org/api/modules.json`,
      `https://nodejs.org/api/net.json`,
      `https://nodejs.org/api/os.json`,
      `https://nodejs.org/api/path.json`,
      `https://nodejs.org/api/process.json`,
      `https://nodejs.org/api/punycode.json`,
      `https://nodejs.org/api/querystring.json`,
      `https://nodejs.org/api/readline.json`,
      `https://nodejs.org/api/repl.json`,
      `https://nodejs.org/api/stream.json`,
      `https://nodejs.org/api/string_decoder.json`,
      `https://nodejs.org/api/timers.json`,
      `https://nodejs.org/api/tls.json`,
      `https://nodejs.org/api/tty.json`,
      `https://nodejs.org/api/dgram.json`,
      `https://nodejs.org/api/url.json`,
      `https://nodejs.org/api/util.json`,
      `https://nodejs.org/api/v8.json`,
      `https://nodejs.org/api/vm.json`,
      `https://nodejs.org/api/zlib.json`,
    ];
  }

  async getDocs (version) {
    if (this.docs[version]) {
      return this.docs[version];
    }

    const link = `https://nodejs.org/dist/latest-${version}.x/docs/api/all.json`
    
    const res = await fetch(link)
    const json = res.json();

    this.docs[version] = json;

    return json;
  }

  async run (msg, {query,version}) {
    try {
  
      const docs = await this.getDocs(version)

      const sourceBaseURL = `https://github.com/discordjs/${version === 'commando' ? 'commando/blob/master' : `discord.js/blob/${version}`}`;
      const hitOpts = {
        shouldSort: true,
        threshold: 0.3,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: ['name']
      }
      const input = {
        main: query[0],
        sub: query[1] ? query[1].replace(/(\(.*\))/gm, '') : null
      }
      
      const docsSearch = new Fuse(docs.methods.concat(docs.classes).concat(docs.globals).concat(docs.modules), hitOpts).search(input.main);

      const hit = docsSearch[0];

      console.log(hit)
/* 
      const docsEmbed = new MessageEmbed()
        .setColor(0xcd6e57)
        .setAuthor(version === 'commando' ? 'Documentation Commando' : `Documentation Discord.JS (${version})`, 'https://github.com/discordjs.png')
        .setFooter(msg.guild ? msg.guild.name : '',msg.guild ? msg.guild.iconURL({format: 'png'}) : msg.client.user.avatarURL({format: 'png'}))
        .setTimestamp()

      if (input.sub) {
        const subopts = {
          shouldSort: true,
          threshold: 0.2,
          location: 5,
          distance: 0,
          maxPatternLength: 32,
          minMatchCharLength: 1,
          keys: ['name']
        }

        const propsFuse = hit.props ? new Fuse(hit.props, subopts) : null
        const methodFuse = hit.methods ? new Fuse(hit.methods, subopts) : null
        const eventsFuse = hit.events ? new Fuse(hit.events, subopts) : null
        
        const subHit = {
          props: propsFuse ? propsFuse.search(input.sub) : [],
          methods: methodFuse ? methodFuse.search(input.sub) : [],
          events: eventsFuse ? eventsFuse.search(input.sub) : []
        };

        subLoop: for (const sub in subHit) {
          if (subHit[sub].length) {
            const res = subHit[sub][0];

            Array.prototype.toString = function () {
              return this.join('');
            };

            switch (sub) {
            case 'props':
              docsEmbed
                .setDescription(`[__**${hit.name}.${res.name}**__](${this.getLink(hit.name, version, docs)}?scrollTo=${res.name})\n${hit.description}`)
                .addField('Type', `${this.addType(res.type, version, docs)}`);
              break subLoop;
            case 'methods':
              docsEmbed
                .setDescription(`[__**${hit.name}.${res.name}()**__](${this.getLink(hit.name, version, docs)}?scrollTo=${res.name})\n${hit.description}`)
                .addField('Parameters',res.params.map(param => `\`${param.optional ? `[${param.name}]` : param.name}:\` **${this.addType(param.type, version, docs).join(' | ')}**\n${this.clean(param.description)}\n`))
                .addField('Returns', `${res.returns.description ? `${this.clean(res.returns.description)}` : ''} **⇒** **${this.addType(res.returns.types || res.returns, version, docs)}**`)
                .addField('Example(s)', `\`\`\`js\n${res.examples.join('```\n```js\n')}\`\`\``)
                .addField('\u200b', `[View Source](${sourceBaseURL}/${res.meta.path}/${res.meta.file}#L${res.meta.line})`);
              break subLoop;
            case 'events':
              docsEmbed
                .setDescription(`[__**${hit.name}.on('${res.name}' … )**__](${this.getLink(hit.name, version, docs)}?scrollTo=${res.name})\n${hit.description}`)
                .addField('Parameters',
                  res.params.map(param => `\`${param.optional ? `[${param.name}]` : param.name}:\` **${this.addType(param.type, version, docs)}**\n${this.clean(param.description)}\n`))
                .addField('\u200b', `[View Source](${sourceBaseURL}/${res.meta.path}/${res.meta.file}#L${res.meta.line})`);
              break subLoop;
            default:
              throw new Error('nope');
            }
          } else if (sub === 'events') {
            throw new Error('nope');
          }
        }
      } else {
        docsEmbed.setDescription(`[__**${hit.name}**__](${this.getLink(hit.name, version, docs)})${hit.extends ? ` (extends [**${hit.extends}**](${this.getLink(hit.extends[0], version, docs)}))` : ''}\n${hit.description}`);

        hit.props ? docsEmbed.addField('Properties', `\`${hit.props.map(p => p.name).join('` `')}\``) : null;
        hit.methods ? docsEmbed.addField('Methods', `\`${hit.methods.map(m => m.name).join('` `')}\``) : null;
        hit.events ? docsEmbed.addField('Events', `\`${hit.events.map(e => e.name).join('` `')}\``) : null;
        hit.type ? docsEmbed.addField('Type', this.addType(hit.type, version, docs)) : null;

        docsEmbed.addField('\u200b', `[View Source](${sourceBaseURL}/${hit.meta.path}/${hit.meta.file}#L${hit.meta.line})`);
      }

      return msg.embed(docsEmbed); */
    } catch (err) {
      console.log(err)
      return msg.reply(`could not find an item for \`${query}\` in mdn docs.`);
    }
  }
};