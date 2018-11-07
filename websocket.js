const express = require('express')
const {getUsersXpByGuild} = require('./utils.js');

class WebSocket {

    constructor(token, port, client) {
        this.token = token
        this.port = port
        this.client = client
        this.app = express()

        this.app.use(express.static('static'));

        this.app.get('/api/commands', (req, res) => res.status(200).send({ commands : this.client.registry.groups.map(grp => grp.commands)}))

        this.app.get('/api/levels/:guild', (req, res) => {
            const guild = req.params.guild;
            getUsersXpByGuild(guild).then(response => {
                res.status(200).send({ users: response})
            })
        })

        this.server = this.app.listen(port, () => {
            console.log("Websocket API set up at port " + this.server.address().port)
        })
    }
}

module.exports = WebSocket