const ClientSocket = require("./ClientSocket");
const net = require("net");
/**
 * @class ProxyController
 * @prop {number} uniqueID unique ID getter - returns higher ID every time
 * */
class ProxyController {
    /**
     * 
     * @param {ClientSocket} client
     * @param {number} port
     * @param {"tcp"|"udp"} type
     */
    constructor(client, port, type) {
        this.client = client;
        this.port = port;
        this.type = type;
        this.serverId = "";

        let uniqueIDCounter = 0;
        Object.defineProperty(this, "uniqueID", {
            get: () => {
                return uniqueIDCounter++;
            }
        });

        this.client.socket.on("disconnect", () => {
            this.destroy();
        });
    }
    handleSocket(socket, ID) {
        throw new Error("Pure virtual method call!");
    }
    addDataLayer(iosocket, identification) {
        throw new Error("Pure virtual method call!");
    }
    destroy() {
        if (!this.destroyed) {
            this.destroyed = true;
            this.client.socket.disconnect();
            this.client.socket.removeAllListeners();
            this.client.server.removeServer(this);

            this.client.socket = null;
            this.client.server = null;
            this.client = null;
        }
    }
}
module.exports = ProxyController;