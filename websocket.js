const express = require('express')

class WebSocket {

    constructor(token, port, client) {
        this.token = token
        this.port = port
        this.client = client
        this.app = express()

        this.app.use(express.static('static'));

        this.app.get('/api/commands', (req, res) => res.json({ commands: this.client.registry.groups.map(grp => grp.commands) }))

        this.server = this.app.listen(port, () => {
            console.log("Websocket API set up at port " + this.server.address().port)
        })
    }
}

module.exports = WebSocket