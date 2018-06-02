const net = require("net");

class ForwardingManager {
    /**
     * 
     * @param {net.Server} server
     * @param {ManagementServer} manserver
     */
    constructor(server, manserver) {
        server.on("connection", (socket) => {
            console.log("[REMOTE] Forwarding request received.");
            this.handleForwarding(socket);
        })
        this.manserver = manserver;
        this.server = server;
    }
    /**
     * 
     * @param {NodeJS.Socket} socket
     */
    handleForwarding(socket) {
        const dataHandler =             
             /*** @param {Buffer} data **/
            (data) => {
                if (data.length < 8) {
                    socket.unshift(data);
                    return;
                }
                const clientID = data.readInt32LE(0);
                const port = data.readInt32LE(4);
                console.log("[REMOTE] Forwarding request for port " + port + " and client ID: " + clientID);
                this.manserver.forwardSocket(socket, port, clientID);
                data = data.slice(8);
                socket.unshift(data);
                socket.removeListener("data", dataHandler);

            };
        socket.on("data", dataHandler);
    }
}
module.exports = ForwardingManager;