const dgram = require("dgram");
const socketioclient = require("socket.io-client");
const AVP2ServerInfo = require("./AVP2ServerInfo");
/**
 * Use bind to bind this function to the object you wanna compare against.
 * @param {dgram.AddressInfo} otherInfo
 * @param {dgram.AddressInfo} this
 */
function AddressInfoComparator(otherInfo) {
    return otherInfo.address == this.address
        && otherInfo.family == this.family
        && otherInfo.port == this.port;
}

/** @typedef {{addr: dgram.AddressInfo, last: number, local_id: number}} SavedClient */

class AVP2ClientProxy {
    constructor(remoteAddr, remoteServerId, remotePort = 80, localPort = 27888) {
        this.localPort = localPort;
        this.remotePort = remotePort;
        this.remoteAddr = remoteAddr;
        
        this.remoteServerId = remoteServerId;

        this.localClientId = 0;

        this.receiverSocket = dgram.createSocket("udp4");
        this.receiverSocket.on("message", (msg, addr) => {
            //console.log("[AVP2ClientProxy] Message from ", addr);
            const msgstr = msg.byteLength < 10 ? msg.toString("utf8") : "";

            //if (!this.clients.find(AddressInfoComparator.bind(addr))) {
            //    console.log("[AVP2ClientProxy] Adding new client ", addr);
            //    this.clients.push(addr);
            //}

            if (msgstr == "\\status\\") {
                //receiverSocket.send(responseBuffer, 0, responseBuffer.byteLength, addr.port, addr.address);
                if (this.serverInfoRequests.length == 0) {
                    console.log("[AVP2ClientProxy] Requesting server status!");
                    this.client.emit("serverinfo");
                }
                if (!this.serverInfoRequests.find(AddressInfoComparator.bind(addr))) {
                    console.log("[AVP2ClientProxy] Adding new client for server info request ", addr);
                    this.serverInfoRequests.push(addr);
                }
            }
            else {
                // console.log("[AVP2ClientProxy] Redirecting UDP message (" + msg.byteLength + " bytes)");
                /** @type {SavedClient} **/
                let client = null;
                for (let i = 0, l = this.clients.length; i < l; ++i) {
                    if (AddressInfoComparator.call(addr, this.clients[i].addr)) {
                        client = this.clients[i];
                        break;
                    }
                }
                if (!client) {
                    client = {
                        addr: addr,
                        last: new Date().getTime(),
                        local_id: ++this.localClientId
                    }
                    this.clients.push(client);
                    console.log("[AVP2ClientProxy] Created new client, #" + client.local_id);
                }

                this.client.emit("udp_message", { datagram: msg, local_id: client.local_id });
            }
        });
        this.receiverSocket.bind(localPort);
        /** @type {SavedClient[]} **/
        this.clients = [];

        // An array of addresses where should be the next server info sent
        /** @type {dgram.AddressInfo[]} **/
        this.serverInfoRequests = [];


        const srvurl = "http://" + remoteAddr + ":" + remotePort;
        this.client = socketioclient(srvurl);
        console.log("[AVP2ClientProxy] Connecting to server: ", srvurl)
        this.client.once("connect", () => {
            console.log("[AVP2ClientProxy] Connected to remote server, identificating.")
            this.sendIdentification();
        });

        this.client.on("error", () => {
            console.error("[AVP2ClientProxy] Socket IO connection error.");
        });
        this.client.on("udp_message", (info) => {
            //console.log("[AVP2ClientProxy] Received datagram: ", info.datagram.byteLength,"bytes");
            for (let i = 0, l = this.clients.length; i < l; ++i) {
                const item = this.clients[i];
                if (info.local_id == item.local_id) {
                    this.receiverSocket.send(info.datagram, 0, info.datagram.byteLength, item.addr.port, item.addr.address);
                    break;
                }
            }
        });
        this.client.on("serverinfo", (info) => {
            console.log("[AVP2ClientProxy] Received server info.");
            const parsedinfo = new AVP2ServerInfo(info);
            parsedinfo.hostport = this.localPort;
            parsedinfo.hostname += " [PROXY]";
            parsedinfo.hostname = parsedinfo.hostname.replace("Aliens vs. Predator 2", "AVP2");

            const infodgram = new Buffer(parsedinfo.toString());
            for (let i = 0, l = this.serverInfoRequests.length; i < l; ++i) {
                const item = this.serverInfoRequests[i];
                console.log("[AVP2ClientProxy] Forwardning server info to ", item.port, ":", item.address);
                this.receiverSocket.send(infodgram, 0, infodgram.byteLength, item.port, item.address);
            }
            this.serverInfoRequests.length = 0;
        });
    }
    sendIdentification() {
        const identify = { port: "io", protocol: "AVP2", dataLayer: "CLIENT", serverId: this.remoteServerId };

        this.client.emit("identify", identify);
    }
}
module.exports = AVP2ClientProxy;