const ProxyServerUDP_socketio = require("./ProxyServerUDP_socketio");

/**
 * @typedef {Object} UDPServerOptions
 * @prop {number} appPort port of the local application server
 * @prop {string|"127.0.0.1"} appAddr IP/hostname of the local application server
 * @prop {string} remoteAddr IP/hostname of the remote management server
 * @prop {number} remotePort port of the websocket communication channel
 */

class ProxyServerGaming extends ProxyServerUDP_socketio {
    /**
     * 
     * @param {UDPServerOptions} options
     */
    constructor(options) {
        super(options);
        this.client.on("serverinfo", async () => {
            if (this.serverInfoPromise == null) {
                this.serverInfoPromise = this.serverInfoRequested();
            }
            const responseData = await this.serverInfoPromise;
            this.sendServerInfo(responseData);
        });
        this.lastServerInfo = 0;
        /** @type {Buffer} Cached server info value**/
        this.lastServerInfoValue = null;
    }
    /**
     * Generates Buffer that willbe sent to server to
     * request server info
     * @returns {Buffer}
     * */
    generateServerInfoRequest() {
        throw new Error("Pure virtual method call!");
    }

    /**
     * Do not override unless really necessary. This method will try to get the serer info from the 
     * real server. It caches the info. To transform the info as needed, override processServerInfo()
     * @returns {Promise<Buffer>}
     * */
    async serverInfoRequested() {
        if (new Date().getTime() - this.lastServerInfo < 1000 && this.lastServerInfoValue!=null) {
            return this.lastServerInfoValue;
        }
        return await new Promise((resolve, reject) => {
            console.error("[ProxyServerGaming] requesting server info from server at ", this.appPort, ":", this.appAddr);
            this.lastServerInfo = new Date().getTime();
            const tmpsocket = dgram.createSocket("udp4");
            const msgListener =
                /**
                 * @param {Buffer} msg
                 * @param {dgram.AddressInfo} addr
                 **/
                (msg, addr) => {
                    if (this.isServerInfo(msg)) {
                        clearInterval(attemptInterval);
                        console.error("[ProxyServerGaming] Forwarding server info to proxy hub.");
                        this.lastServerInfoValue = this.processServerInfo(msg);
                        resolve(this.lastServerInfoValue);
                    }
                    else {
                        console.error("[ProxyServerGaming] Received invalid server info dgram.");
                    }
                };
            tmpsocket.once("message", msgListener);
            const statusInfoRequestDatagram = this.generateServerInfoRequest();

            const msgSender = () => {
                tmpsocket.send(statusInfoRequestDatagram, 0, statusInfoRequestDatagram.byteLength, this.appPort, this.appAddr);
                attempts++;
                if (attempts > 20) {
                    const errorMsg = "[ProxyServerGaming] Server closed or unreachable!";
                    clearInterval(attemptInterval);
                    console.error(errorMsg);
                    reject(new Error(errorMsg));
                }
            }
            let attempts = 0;
            const attemptInterval = setInterval(msgSender, 20);
        });
        
    }
    // override this to be able to transform server data
    processServerInfo(serverInfoData) {
        return serverInfoData;
    }
    sendServerInfo(serverInfoData) {
        this.client.emit("serverinfo", serverInfoData);
    }
    //
    /**
     *  Overide this to impose strict control over server info packets
     * @param {Buffer} data
     * @returns {boolean} if you return false, the pcket will be ignored
     */
    isServerInfo(data) {
        return true;
    }
}
module.exports = ProxyServerGaming;