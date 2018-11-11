const Fuse = require('fuse.js');
const fetch = require('node-fetch');
const {Command} = require('discord.js-commando');
const {MessageEmbed} = require('discord.js');

module.exports = class DdocsCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'ddocs',
      memberName: 'ddocs',
      group: 'dev',
      aliases: ['discordjs', 'discord.js', 'djs','docs'],
      description: 'Afficher la documentation de Discord.js',
      format: 'Version à trouver [master|stable|commando]',
      examples: ['docs User'],
      args: [
        {
          key: 'query',
          prompt: 'Que souhaitez vous trouver ?\n',
          type: 'string',
          parse: p => p.split(/[\#\.]/)
        },
        {
          key: 'version',
          prompt: 'Quelle version de la documentation voulez vous (stable, master, commando)?',
          type: 'string',
          parse: value => value.toLowerCase(),
          validate: value => ['master', 'stable', 'commando'].includes(value),
          default: 'stable'
        }
      ]
    });

    this.docs = {};
  }

  async getDocs (version) {
    if (this.docs[version]) {
      return this.docs[version];
    }

    const link = version === 'commando'
        ? 'https://raw.githubusercontent.com/Gawdl3y/discord.js-commando/docs/master.json'
        : `https://raw.githubusercontent.com/discordjs/discord.js/docs/${version}.json`,
      res = await fetch(link),
      json = res.json();

    this.docs[version] = json;

    return json;
  }

  clean (text) {
    return text.replace(/\n/g, ' ')
      .replace(/<\/?(?:info|warn)>/g, '')
      .replace(/\{@link (.+?)\}/g, '`$1`');
  }

  addType (types, version, docs) {
    return types.map(type => type.map((t) => {
      if (t.length === 1) {
        return `[${t[0]}](${this.getLink(t[0], version, docs)})`;
      } else if (t[1] === '>') {
        return `[<${t[0]}>](${this.getLink(t[0], version, docs)})`;
      }

      return `[${t[0]}](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/${t[0]})`;
    }));
  }

  getLink (prop, version, docs) {
    let section = 'classes';
    const baseURL = `https://discord.js.org/#/docs/${version === 'commando' ? 'commando/master' : `main/${version}`}`;
    const match = docs[section].find(el => el.name === prop);

    if (!match || match.name !== prop) {
      section = 'typedefs';
    }

    return `${baseURL}/${section === 'classes' ? 'class' : 'typedef'}/${prop}`;
  }

  async run (msg, {query, version}) {
    try {

      const docs = await this.getDocs(version);
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
      
      const docsSearch = new Fuse(docs.classes.concat(docs.typedefs), hitOpts).search(input.main);

      const hit = docsSearch[0];

      const docsEmbed = new MessageEmbed()
        .setColor(0xcd6e57)
        .setAuthor(version === 'commando' ? 'Documentation Commando' : `Documentation Discord.JS (${version})`, 'https://github.com/discordjs.png');

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

      return msg.embed(docsEmbed);
    } catch (err) {
      return msg.reply(`could not find an item for \`${query.join('.')}\` in the ${version === 'commando' ? 'Commando' : `Discord.JS ${version}`} docs.`);
    }
  }
};