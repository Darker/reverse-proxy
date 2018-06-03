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
 * @prop {number} client numeric ID of either source or target
 */


class ProxyControllerUDP_socketio extends ProxyController {
    /**
     * 
     * @param {ClientSocket} client
     */
    constructor(client) {
        super(client, "io", "udp")
        /** @type {{socket: client, id: number}[]} **/
        this.clients = [];
        this.client.on("udp_message",
            /** @param {UDPResponseMessage} info **/
            (info) => {
                let client = this.clients.find((cli) => {
                    return cli.id == info.client
                });
                if (client) {
                    //console.log("[REMOTE][UDP] Sending datagram to client #", client.id, " - ", info.datagram.byteLength);
                    client.socket.emit("udp_message", {datagram: info.datagram, local_id: info.local_id})
                }
            });
    }
    addDataLayer(iosocket, identification) {
        if (identification == "CLIENT") {
            console.log("[REMOTE][UDP] Adding socket.io client");
            const this_client = {
                id: this.uniqueID,
                socket: iosocket
            };
            this.addIOClient(this_client);
            iosocket.on("udp_message",
                /** @param {UDPResponseMessage} info **/
                (info) => {
                    this.client.emit("udp_message", { datagram: info.datagram, client: this_client.id, local_id: info.local_id })
                }
            );
            iosocket.on("close", () => {
                this.clients.splice(this.clients.indexOf(this_client), 1);
            });
        }
        else {
            iosocket.close();
        }
    }
    /**
     * 
     * @param {{socket: io.ClientSocket, id: number}} clientInfo
     */
    addIOClient(clientInfo) {
        this.clients.push(clientInfo);
    }
}
module.exports = ProxyControllerUDP_socketio;