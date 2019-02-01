const express = require('express')
const {getUsersXpByGuild,getUser} = require('./utils.js');

class WebSocket {

    constructor(token, port, client) {
        this.token = token
        this.port = port
        this.client = client
        this.app = express()
        this.app.use(function(req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next();
        });

        this.app.get('/api/commands', (req, res) => res.status(200).send({ commands : this.client.registry.groups.map(grp => grp.commands)}))

        this.app.get('/api/levels/:guild', (req, res) => {
            const guild = req.params.guild;
            getUsersXpByGuild(guild).then(response => {
                
                res.status(200).send({ users: response.map(userS => this.client.users.fetch(userS.user).then(user => userS.user = user))})
            })
        })

        this.app.get('/api/getuser/:user', (req, res) => {
            const user = req.params.user;
            getUser(user,this.client).then(response => {
                res.status(200).send({ user: response})
            })
        })

        this.server = this.app.listen(port, () => {
            console.log("Websocket API set up at port " + this.server.address().port)
        })
    }
}

module.exports = WebSocket