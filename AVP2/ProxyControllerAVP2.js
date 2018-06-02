//const dgram = require("dgram");
//const fs = require("fs");


//const receiverSocket = dgram.createSocket("udp4");
//receiverSocket.on("message", (msg, addr) => {
//    console.log("Message from ", addr);
//    const msgstr = msg.byteLength < 15 ? msg.toString("utf8") : "";
    
//    if (msgstr == "/status/") {
//        receiverSocket.send(responseBuffer, 0, responseBuffer.byteLength, addr.port, addr.address);
//        console.log("Sendind server status response!");
//    }
        
//});
//receiverSocket.bind(27888);
//const responseBuffer = new Buffer("\\gamename\\avp2\\gamever\\1.0.9.1\\location\\0\\hostname\\BLEEEEE\\hostport\\27888\\mapname\\dm_bunker\\gametype\\DM\\gamemode\\openplaying\\numplayers\\0\\maxplayers\\8\\lock\\0\\ded\\1\\maxa\\5\\maxm\\5\\maxp\\5\\maxc\\5\\frags\\30\\score\\0\\time\\600\\rounds\\0\\lc\\0\\hrace\\0\\prace\\0\\ratio\\0\\srace\\0\\mrace\\0\\drace\\0\\dlive\\0\\arace\\0\\alive\\0\\speed\\100\\respawn\\100\\damage\\100\\hitloc\\1\\ff\\1\\mask\\1\\class\\1\\cscore\\0\\final\\\\queryid\\2.1");
//const statusRequestBuffer = new Buffer("/status/");

const ProxyControllerUDP_socketio = require("../remote/ProxyControllerUDP_socketio")

class ProxyControllerAVP2 extends ProxyControllerUDP_socketio {
    /**
     * 
     * @param {ClientSocket} client
     */
    constructor(client) {
        super(client, "io");
        client.on("serverinfo", (info) => {
            console.log("[ProxyControllerAVP2] Received server info, forwarding it to all clients.");
            for (let i = 0, l = this.clients.length; i < l; ++i) {
                const item = this.clients[i];
                item.socket.emit("serverinfo", info);
            }
        });
    }
    /**
     * 
     * @param {{socket: io.ClientSocket, id: number}} clientInfo
     */
    addIOClient(clientInfo) {
        super.addIOClient(clientInfo);
        clientInfo.socket.on("serverinfo", () => {
            console.log("[ProxyControllerAVP2] Client requested server info.");
            this.client.emit("serverinfo", { type: "request" });
        });
    }
}
module.exports = ProxyControllerAVP2;
