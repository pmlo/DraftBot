const moment = require('moment');
const {Command} = require('discord.js-commando');
const {MessageEmbed} = require('discord.js');
// const RainbowSixApi = require('rainbowsix-api-node');
// const R6 = new RainbowSixApi();
const {deleteCommandMessages} = require('../../utils.js');

module.exports = class OSUCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'rainbowsix',
      memberName: 'rainbowsix',
      group: 'leadersboards',
      description: 'Récupérer les statistiques d\'un joueur Rainbow Six',
      aliases: ['r6','rsix'],
      examples: ['rainbowsix DraftMan_Dev'],
      guildOnly: false,
      args: [
        {
          key: 'user',
          prompt: 'De quel joueur voulez vous les statistiques?',
          type: 'string'
        },
        {
          key: 'plateforme',
          prompt: 'Sur quelle plateforme joue le joueur?',
          type: 'string',
          oneOf: ['uplay','pc','xone','ps4'],
          default: 'uplay',
          parse: plat => {
            const low = plat.toLowerCase()
            return low == 'pc' ? low = 'uplay' : low;
          },
        }
      ]
    });
  }

  async run (msg, {user,plateforme}) {
    // deleteCommandMessages(msg);
    // try {
    //   const stats = await R6.stats(user, plateforme)
    //   console.log(stats)
    // } catch (error) {
    //   console.log(error)
    // }
    
  }
};


