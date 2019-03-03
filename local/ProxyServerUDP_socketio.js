/**
 * @typedef {Object} UDPServerOptions
 * @prop {number} appPort port of the local application server
 * @prop {string|"127.0.0.1"} appAddr IP/hostname of the local application server
 * @prop {string} remoteAddr IP/hostname of the remote management server
 * @prop {number} remotePort port of the websocket communication channel
 */

/**
 * @typedef {Object} UDPResponseMessage
 * @prop {Buffer} datagram message data
 * @prop {number} client numeric ID of either source or target
 */
const dgram = require("dgram");
const socketioclient = require("socket.io-client");


const defaultOptions = {
    appAddr: "127.0.0.1",
    remotePort: 81,
}

class ProxyServerUDP_socketio {
    /**
     * 
     * @param {UDPServerOptions} options
     */
    constructor(options) {
        for (var name in defaultOptions) {
            if (!options[name])
                options[name] = defaultOptions[name];
        }

        this.appPort = options.appPort;
        this.appAddr = options.appAddr;
        if (options.serverId) {
            this.serverId = options.serverId;
        }

        this.remotePort = options.remotePort;
        this.remoteAddr = options.remoteAddr;
        this.remotePort = options.remotePort;

        const srvurl = "http://" + this.remoteAddr + ":" + this.remotePort;

        console.log("[UDP_socketio] Connecting to server: ", srvurl)
        this.client = socketioclient(srvurl, { XXpath: "/" });
        
        this.client.once("connect", () => {
            console.log("[UDP_socketio] Connected to remote server, identificating.")
            this.sendIdentification();
        });

        this.client.on("error", () => {
            console.error("[UDP_socketio] Socket IO connection error.")
        });
        this.client.on("proxy-error", (error) => {
            console.error("[UDP_socketio] Remote server reported error: ", error.msg);
            this.client.disconnect();
        });
        /** @type {{socket:dgram.Socket,client: number, local_id: number}[]} **/
        this.ioClients = [];
        this.client.on("udp_message",
            /** @param {UDPResponseMessage} info where on the internet did it come from, important for sending a response **/
            (info) => {
                let client = this.ioClients.find((entry) => {
                    return info.client == entry.client && info.local_id == entry.local_id
                });
                if (client == null) {
                    console.log("[UDP_socketio] Creating new UDP client!");

                    client = {
                        socket: dgram.createSocket('udp4'),
                        client: info.client,
                        local_id: info.local_id
                    };
                    //client.socket.on('listening', function () {
                    //    var address = server.address();
                    //    console.log('[LOCAL] UDP client listening on ' + address.address + ":" + address.port);
                    //});
                    client.socket.on("message", (data, info) => {
                        //console.log("[UDP_socketio] UDP message received originally from ", info," - ",data.byteLength, " bytes");
                        this.client.emit("udp_message", { datagram: data, client: client.client, local_id: client.local_id });
                    });

                    this.ioClients.push(client);
                }
                //console.log("[UDP_socketio] Forwarding datagram from client #", client.client, " - ", info.datagram.byteLength,"bytes");
                client.socket.send(info.datagram, 0, info.datagram.byteLength, this.appPort, this.appAddr);
            });
    }
    sendIdentification() {
        const identPacket = { port: "io", protocol: "UDP_socketio" };
        if (this.serverId)
            identPacket.serverId = this.serverId;
        this.client.emit("identify", identPacket);
    }
}
module.exports = ProxyServerUDP_socketio;