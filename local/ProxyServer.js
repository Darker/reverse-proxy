const socketioclient = require("socket.io-client");
const net = require("net");

/**
 * @typedef {Object} ServerOptions
 * @prop {number} appPort port of the local application server
 * @prop {string|"127.0.0.1"} appAddr IP/hostname of the local application server
 * @prop {number|appPort} remoteAppPort port to be registered on the remote server, defaults to app port
 * @prop {string} remoteAddr IP/hostname of the remote management server
 * @prop {number} remotePort port of the websocket communication channel
 * @prop {number} remoteManPort port for the proxy communication sockets
 */


const defaultOptions = {
    appAddr: "127.0.0.1",
    remotePort: 81,
}

class ProxyServer {
    /**
     * 
     * @param {ServerOptions} options
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
        this.remoteManPort = options.remoteManPort;

        if (this.remoteAppPort == this.remoteManPort) {
            throw new Error("Remote application port cannot be the same as remote management port!");
        }

        this.client = socketioclient("http://"+this.remoteAddr + ":" + this.remotePort);
        this.client.once("connect", () => {
            console.log("[LOCAL] Connected to remote server, identificating.")
            this.sendIdentification();
        });
        this.client.on("newclient", (clientInfo) => {
            console.log("[LOCAL] New client request with ID: ", clientInfo.id)
            this.handleClient(clientInfo.id)
        });
        this.client.on("error", () => {
            console.error("[LOCAL] Socket IO connection error.")
        });
        this.client.connect();

        /** @type {{remote:NodeJS.Socket, local:NodeJS.Socket, id:number}[]} **/
        this.existingConnections = [];
    }
    webSocketConnected() {

    }
    sendIdentification() {
        this.client.emit("identify", { port: this.remoteAppPort });
    }
    webSocketEnd() {

    }
    handleClient(id) {
        const remoteSocket = net.createConnection({
            port: this.remoteManPort,
            host: this.remoteAddr
        });
        const localSocket = net.createConnection({
            port: this.appPort,
            host: this.appAddr
        });
        let oneConnected = false;
        const connectionHandler = () => {
            if (oneConnected) {
                localSocket.pipe(remoteSocket);
                remoteSocket.pipe(localSocket);
                console.log("[LOCAL] Connections piped!");
            }
            else 
                oneConnected = true;
        }
        localSocket.once("connect", () => {
            console.log("[LOCAL] Connected to local app.");
            connectionHandler();
        })
        remoteSocket.once("connect", () => {
            const buffer = new Buffer(8);
            buffer.writeInt32LE(id * 1, 0);
            buffer.writeInt32LE(this.remoteAppPort, 4);
            console.log("[LOCAL] Connected to remote proxy server.");
            remoteSocket.write(buffer);
            connectionHandler();
        });
    }
}
module.exports = ProxyServer;