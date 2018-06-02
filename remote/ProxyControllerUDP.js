const ProxyController = require("./ProxyController");
const dgram = require("dgram");

/**
 * @typedef {Object} UDPAddrInfo
 * @prop {string} address
 * @prop {string} family
 * @prop {string} port
 */
/**
 * @typedef {Object} UDPResponseMessage
 * @prop {Buffer} datagram message data
 * @prop {{address:string, family:string, port:string}} info address info
 * @prop {UDPAddrInfo} target ip and port of the message target
 */


class ProxyControllerUDP extends ProxyController {
    /**
     * 
     * @param {ClientSocket} client
     * @param {number} port
     */
    constructor(client, port) {
        super(client, port, "udp")
        this.udpClient = dgram.createSocket('udp4');
        this.udpClient.bind(port);
        this.udpClient.on("message", (data, info) => {
            console.log("[REMOTE] UDP message received.");

            this.client.emit("udp_message", { buffer: data, info: info });

            let client = this.udpClients.find((entry) => {
                return entry.ip == info.address
                    && entry.family == info.family
                    && entry.port == info.port;
            });
            if (client == null) {
                console.log("[REMOTE] Creating new UDP client!");

                client = {
                    socket: null,
                    ip: info.address,
                    family: info.family,
                    port: info.port
                };
                //client.socket.on('listening', function () {
                //    var address = server.address();
                //    console.log('[LOCAL] UDP client listening on ' + address.address + ":" + address.port);
                //});
                //client.socket.on("message", (data, info) => {
                //    console.log("[REMOTE] UDP message received.");
                //    this.client.emit("udp_message", { buffer: data, info: info, target: info });
                //});

                this.udpClients.push(client);
            }
        });

        /** @type {{socket:dgram.Socket,ip:string,port:string,family:string}[]} **/
        this.udpClients = [];
        this.client.on("udp_message",
            /** @param {UDPResponseMessage} info **/
            (info) => {
                let client = this.udpClients.find((entry) => {
                    return entry.ip == info.target.address
                        && entry.family == info.target.family
                        && entry.port == info.target.port;
                });
                if (client) {
                    this.udpClient.send(info.datagram, info.target.port, info.target.address);
                }
            });
    }
    addDataLayer(iosocket, identification) {
        if (identification == "CLIENT") {
            console.log("[REMOTE][UDP] Adding socket.io client");
            iosocket.on("udp_message", 
                /** @param {UDPResponseMessage} info **/
                (info) => {
                    this.client.emit()
                }
            );
        }
    }
}
module.exports = ProxyControllerUDP;