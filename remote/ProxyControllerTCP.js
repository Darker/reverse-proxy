const ProxyController = require("./ProxyController");
const net = require("net");

class ProxyControllerTCP extends ProxyController {
    /**
     * 
     * @param {ClientSocket} client
     * @param {number} port
     */
    constructor(client, port) {
        super(client, port, "tcp")
        this.server = net.createServer();
        this.server.listen(port);
        this.server.on("connection", (socket) => {
            this.handleConnection(socket);
        });
        /** @type {{[id:number]:NodeJS.Socket}} **/
        this.sockets = {};
    }
    /**
     * 
     * @param {NodeJS.Socket} socket
     */
    handleConnection(socket) {
        socket.ID = this.uniqueID;
        this.sockets[socket.ID] = socket;
        socket.once("close", () => {
            delete this.sockets[socket.ID];
            this.client.emit("close", { id: socket.ID });
        });
        this.client.emit("newclient", { id: socket.ID })
    }
    /**
     * Forward waiting remote client to local server's socket
     * @param {NodeJS.Socket} masterSocket 
     * @param {number} id
     */
    handleSocket(localSocket, id) {
        if (this.sockets[id]) {
            this.sockets[id].pipe(localSocket);
            localSocket.pipe(this.sockets[id]);
        }
        else {
            masterSocket.close();
        }
    }
}
module.exports = ProxyControllerTCP;