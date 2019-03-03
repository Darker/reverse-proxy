const net = require("net");
const io = require("socket.io");
const ClientSocket = require("./ClientSocket");
const ProxyControllerTCP = require("./ProxyControllerTCP");
const ProxyControllerUDP = require("./ProxyControllerUDP");
const ProxyControllerUDP_socketio = require("./ProxyControllerUDP_socketio");
const UDPProxyBidirectional = require("../generic/UDPProxyBidirectional");
const ProxyController = require("./ProxyController");
const ProxyControllerAVP2 = require("../AVP2/ProxyControllerAVP2");
const ForwardingManager = require("./ForwardingManager");


/** @type {{[x:string]: new ProxyController}} **/
const servers = {
    TCP: ProxyControllerTCP,
    UDP: ProxyControllerUDP,
    UDP_sym: UDPProxyBidirectional,
    UDP_socketio: ProxyControllerUDP_socketio,
    AVP2: ProxyControllerAVP2
};

class ManagementServer {
    /**
     * 
     * @param {number} port port for the management communication channel
     * @param {number} handlerPort port for sockets to handle incoming connections
     */
    constructor(port, handlerPort) {
        //this.http_server = net.createServer();
        //// this didn't work too. Exxentially socket io does not work at all
        ////   this.io = io.listen(typeof port == "number" ? port : process.env.PORT);
        //console.log("[ManagementServer] Attaching socket IO to HTTP server.");
        //this.io = io(this.http_server, {
        //    serveClient: false,
        //    XXpath: "/",
        //});
        ///// The port does open
        //this.http_server.listen(typeof port == "number" ? port : process.env.PORT,
        //    () => {
        //        console.log('[ManagementServer] IO HTTP server listening on port', this.http_server.address().port)
        //    });
        ///// The connection listener is triggered, but IO doesn't bother 
        ///// replying or something
        //this.http_server.on("connection", (req, res) => {
        //    console.log("[ManagementServer] Connection received, but IO ignores it.")
        //});
        // Never happens

        this.io = io.listen(port);
        this.io.on("connection", (socket) => {
            this.connection(socket);
        })

        this.io.on("error", () => {
            console.error("[ManagementServer] IO Error!")
        })
        //this.server.listen(typeof port == "number" ? port : process.env.PORT);
        
        this.handlerPort = handlerPort;

        /** @type {{[port:number]:ProxyController}} **/
        this.proxies = {};
        /** @type {ProxyController[]} **/
        this.ioproxies = [];
        this.ioproxyCounter = 0;
    }

    /** @type {net.Server} **/
    get handlerServer() {
        if (!this._handlerServer) {
            this._handlerServer = net.createServer();
            this._handlerServer.listen(this.handlerPort);
        }
        return this._handlerServer;
    }

    /** @type {ForwardingManager} **/
    get forwardingManager() {
        if (!this._forwardingManager) {
            this._forwardingManager = new ForwardingManager(this.handlerServer, this);
        }
        return this._forwardingManager;
    }


    connection(iosocket) {
        console.log("[ManagementServer] New local proxy connected.");
        const socket = new ClientSocket(iosocket, this);
        
        socket.onceTimeout("identify", (identInfo) => {
            if (identInfo.dataLayer) {
                let server = null;
                // this means this is remote client's data layer used for advanced communication
                if (identInfo.port && identInfo.port != "io") {
                    server = this.proxies[identInfo.port];
                }
                else if (identInfo.serverId) {
                    server = this.findIoProxy(identInfo.serverId);
                }
                if (server) {
                    let error = server.addDataLayer(socket, identInfo.dataLayer);
                    if (error === true ) {
                        socket.emit("info", { msg: "Connected OK to " + server.port + " " + server.serverId });
                    } else {
                        this.disconnectWithError(socket, "Server refused connection, message:" + error);
                    }
                }
                else {
                    console.log("[ManagementServer] Invalid data layer!");
                    this.disconnectWithError(socket, "Invalid data layer identification: server not found");
                }
            } else {
                const server = typeof identInfo.protocol == "string" ?
                    new servers[identInfo.protocol](socket, identInfo.port)
                    :
                    new ProxyControllerTCP(socket, identInfo.port);
                if (identInfo.port == "io") {
                    if (identInfo.serverId) {
                        server.serverId = identInfo.serverId;
                        if (this.findIoProxy(identInfo.serverId)) {
                            console.warn("[ManagementServer] WARN: server ", server.serverId, " already exists!");
                            server.destroy();
                            return;
                        }
                    }
                    else
                        server.serverId = this.ioproxyCounter++;
                    console.log("[ManagementServer] New IO server with ID ", server.serverId);

                    this.ioproxies.push(server);
                }
                else {
                    this.proxies[identInfo.port] = server;
                    console.log("[ManagementServer] Local server registered on port ", identInfo.port, " with driver: " + server.constructor.name);
                }
            }
        }, 1000);
    }
    /**
     * Local server has requested to handle a remote socket on given port.
     * @param {NodeJS.Socket} socket
     * @param {number} port
     * @param {number} id
     */
    forwardSocket(socket, port, id) {
        const server = this.proxies[port];
        if (server) {
            server.handleSocket(socket, id);
        }
        else {
            socket.close();
        }
    }
    removeIOClient() {

    }
    /**
     * 
     * @param {ProxyController|ClientSocket} client
     * @param {string} error
     */
    disconnectWithError(client, error) {
        if (client instanceof ProxyController) {

        }
        else {
            client.emit("proxy-error", { msg: error });
            setTimeout(() => {
                client.socket.disconnect();
            },500)
            
        }
    }
    /**
     * 
     * @param {ProxyController} server
     */
    removeServer(server) {
        if (server.port == "io") {
            console.log("[ManagementServer] Removing server ", server.serverId);
            const index = this.ioproxies.findIndex((proxy) => {
                return proxy == server;
            });
            if (index >= 0) {
                this.ioproxies.splice(index, 1);
            }
        }
        else {
            console.log("[ManagementServer] Removing server on port ", server.port);
            delete this.proxies[server.port];
        }
        server.destroy();
    }
    /**
     * 
     * @param {string} serverId
     * @returns {ProxyController}
     */
    findIoProxy(serverId) {
        return this.ioproxies.find((proxy) => {
            return proxy.serverId == serverId;
        });
    }
}
module.exports = ManagementServer;