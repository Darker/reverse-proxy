/**
 * @typedef {Object} UDPServerOptions
 * @prop {number} appPort port of the local application server
 * @prop {string|"127.0.0.1"} appAddr IP/hostname of the local application server
 * @prop {number|appPort} remoteAppPort port to be registered on the remote server, defaults to app port
 * @prop {string} remoteAddr IP/hostname of the remote management server
 * @prop {number} remotePort port of the websocket communication channel
 */

/**
 * @typedef {Object} UDPMessage
 * @prop {Buffer} datagram message data
 * @prop {{address:string, family:string, port:string}} info address info
 */
const dgram = require("dgram");
const socketioclient = require("socket.io-client");


const defaultOptions = {
    appAddr: "127.0.0.1",
    remotePort: 81,
}

class ProxyServerUDP {
    /**
     * 
     * @param {UDPServerOptions} options
     */
    constructor(options) {
        for (var name in defaultOptions) {
            if (!options[name])
                options[name] = defaultOptions[name];
        }

        if (typeof options.remoteAppPort == "undefined") {
            options.remoteAppPort = options.appPort;
        }

        this.appPort = options.appPort;
        this.appAddr = options.appAddr;
        this.remoteAppPort = options.remoteAppPort;
        this.remoteAddr = options.remoteAddr;
        this.remotePort = options.remotePort;

        this.client = socketioclient("http://" + this.remoteAddr + ":" + this.remotePort);
        this.client.once("connect", () => {
            console.log("[LOCAL] Connected to remote server, identificating.")
            this.sendIdentification();
        });

        this.client.on("error", () => {
            console.error("[LOCAL] Socket IO connection error.")
        });
        /** @type {{socket:dgram.Socket,ip:string,port:string,family:string}[]} **/
        this.udpClients = [];
        this.client.on("udp_message",
            /** @param {UDPMessage} info where on the internet did it come from, important for sending a response **/
            (info) => {
                let client = this.udpClients.find((entry) => {
                    return entry.ip == info.info.address
                        && entry.family == info.info.family
                        && entry.port == info.info.port;
                });
                if (client == null) {
                    console.log("[LOCAL] Creating new UDP client!");

                    client = {
                        socket: dgram.createSocket('udp4'),
                        ip: info.info.address,
                        family: info.info.family,
                        port: info.info.port
                    };
                    //client.socket.on('listening', function () {
                    //    var address = server.address();
                    //    console.log('[LOCAL] UDP client listening on ' + address.address + ":" + address.port);
                    //});
                    client.socket.on("message", (data, info) => {
                        console.log("[REMOTE] UDP message received originally from ", info.info," - ",data.byteLength, " bytes");
                        this.client.emit("udp_message", { buffer: data, info: info, target: {ip:client.ip, family:client.family, port:client.port} });
                    });

                    this.udpClients.push(client);
                }
                client.socket.send(info.datagram, this.appPort, this.appAddr);
            });
    }
    sendIdentification() {
        this.client.emit("identify", { port: this.remoteAppPort, protocol: "UDP" });
    }
}
module.exports = ProxyServerUDP;