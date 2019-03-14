//import { clearTimeout } from "timers";

class ClientSocket {
    /**
     * 
     * @param {SocketIO.Socket} socket
     * @param {ManagementServer} server
     */
    constructor(socket, server) {
        this.socket = socket;
        this.server = server;
    }
    on() {
        return this.socket.on.apply(this.socket, arguments);
    }
    emit() {
        return this.socket.emit.apply(this.socket, arguments);
    }
    disconnect() {
        return this.socket.disconnect();
    }
    onceTimeout(eventName, handler, timeMsecs) {
        let timeout = -1;
        const evtHandler = (evtData) => {
            clearTimeout(timeout);
            handler.apply(this.socket, [evtData]);
        }
        timeout = setTimeout(() => {
            this.socket.disconnect();
            this.socket.removeListener(eventName, evtHandler);
        }, timeMsecs);
        this.socket.once(eventName, evtHandler);
    }
}

module.exports = ClientSocket;