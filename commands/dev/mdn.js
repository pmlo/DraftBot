const {Command} = require('discord.js-commando');
const {MessageEmbed} = require('discord.js');
const toMarkdown = require("to-markdown");
const {get} = require("snekfetch");
const {JSDOM} = require("jsdom");

module.exports = class DdocsCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'mdn',
      memberName: 'mdn',
      group: 'dev',
      aliases: ['dmdn'],
      description: 'Afficher la documentation de MDN',
      examples: ['mdn Object'],
      args: [
        {
          key: 'query',
          prompt: 'Que souhaitez vous trouver ?\n',
          type: 'string',
          parse: p => p.replace(/\.prototype\./g, " ").replace(/\./g, " ")
        }
      ]
    });
  }

  async getResult(query) {
    const link = `https://api.duckduckgo.com/?q=mdn+${encodeURI(query)}&format=json`;
    const res = await get(link);
    const data = JSON.parse(res.body);

    const Language = data.meta && data.meta.src_options && data.meta.src_options.src_info;
    if (!data.Heading) return new Error('nope');
    return {
      Heading: data.Heading,
      AbstractURL: data.AbstractURL,
      AbstractSource: data.AbstractSource,
      AbstractText: this.mdnParse(data.AbstractText, Language),
      Language: Language
    };
  }

  mdnParse(str, lang = "") {
    return toMarkdown(str, {
      gfm: true,
      converters: [{
        filter: "pre",
        replacement: content => `\`\`\`${lang.toLowerCase()}\n${content.replace(/<\/?code( \S+)?>/g, ``)}\n\`\`\``,
      }],
    });
  }

  async run (msg, {query}) {
    try {
      const data = await this.getResult(query);

      const DOM = new JSDOM(data.AbstractText)

      const embed = new MessageEmbed()
      .setTitle(data.Heading.slice(0, 256))
      .setColor(0xcd6e57)
      .setDescription(DOM.window.document.querySelector("section").textContent.replace(/\n\n/g, "\n").slice(0, 2042))
      .setURL(data.AbstractURL)
      .setFooter(msg.guild ? msg.guild.name : '',msg.guild ? msg.guild.iconURL({format: 'png'}) : msg.client.user.avatarURL({format: 'png'}))
      .setTimestamp()
      .setAuthor(`MDN Docs`, "https://developer.cdn.mozilla.net/static/img/favicon32.png", "https://developer.mozilla.org/en-US/");

      msg.embed(embed);
    } catch (err) {
      console.log(err)
      return msg.reply(`could not find an item for \`${query}\` in mdn docs.`);
    }
  }
};