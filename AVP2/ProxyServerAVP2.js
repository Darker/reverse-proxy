const ProxyServerUDP_socketio = require("../local/ProxyServerUDP_socketio");
const dgram = require("dgram");
const AVP2ServerInfo = require("./AVP2ServerInfo");
/**
 * @typedef {Object} UDPServerOptions
 * @prop {number} appPort port of the local application server
 * @prop {string|"127.0.0.1"} appAddr IP/hostname of the local application server
 * @prop {string} remoteAddr IP/hostname of the remote management server
 * @prop {number} remotePort port of the websocket communication channel
 * @prop {string|undefined} serverId Id of this server in the big hub, will be auto assigned if not set
 */
/**
 * This class is meant to represent
 * 
 * 
 * */
class ProxyServerAVP2 extends ProxyServerUDP_socketio {
    /**
     * 
     * @param {UDPServerOptions} options
     */
    constructor(options) {
        super(options);
        this.client.on("serverinfo", () => {
            if (new Date().getTime() - this.lastServerInfo < 1000) {
                this.client.emit("serverinfo", this.lastServerInfoValue);
                return;
            }
                
            console.error("[LOCAL][AVP SERVER] requesting server info from server at ", this.appPort, ":", this.appAddr);
            this.lastServerInfo = new Date().getTime();
            const tmpsocket = dgram.createSocket("udp4");
            const msgListener =
                /**
                 * @param {Buffer} msg
                 * @param {dgram.AddressInfo} addr
                 **/
                (msg, addr) => {
                    clearInterval(attemptInterval);
                    if (msg.readUInt8(0) == 0x5c) {// backslash check
                        const infostr = msg.toString();
                        this.client.emit("serverinfo", infostr);
                        this.lastServerInfoValue = infostr;
                        console.log("[LOCAL][AVP SERVER] Server info: ", new AVP2ServerInfo(infostr));
                    }
                    else {
                        console.error("[LOCAL][AVP SERVER] Received invalid server info dgram.");
                    }
                };
            tmpsocket.once("message", msgListener);
            const msgSender = () => {
                tmpsocket.send("\\status\\", this.appPort, this.appAddr);
                attempts++;
                if (attempts > 20) {
                    console.error("[LOCAL][AVP SERVER] Server closed!");
                    clearInterval(attemptInterval);
                }
            }
            
            let attempts = 0;
            const attemptInterval = setInterval(msgSender, 50);
        });
        this.client.on("proxy-error", (err) => {
            console.error("[LOCAL][AVP SERVER] Proxy server error: ", err.msg);
            this.client.disconnect();
        });
        this.lastServerInfo = 0;
    }
    sendIdentification() {
        const identPacket = { port: "io", protocol: "AVP2" };
        if (this.serverId)
            identPacket.serverId = this.serverId;
        this.client.emit("identify", identPacket);
    }
}
module.exports = ProxyServerAVP2;