
const defaultOptions = {
    ipheader: true,
    protocol: 4,

}

class UDPPacket {
    /**
     * 
     * @param {defaultOptions} options
     */
    constructor(options) {
        if (options instanceof Buffer) {
            this.buffer = options;
        }
        else {
            this.buffer = new Buffer(8);
            this.dataBuffer = null;
            this.length = 8;
        }
    }
    

    get UDP_length() {
        return 0;
    }

    get srcPort() {
        return this.buffer.readUInt16BE(0);
    }
    /** @type {number} **/
    set srcPort(value) {
        this.buffer.writeUInt16BE(value, 0);
    }
    get dstPort() {
        return this.buffer.readUInt16BE(2);
    }
    /** @type {number} **/
    set dstPort(value) {
        this.buffer.writeUInt16BE(value, 2);
    }
    get length() {
        return this.buffer.readUInt16BE(4);
    }
    set length(len) {
        return this.buffer.writeUInt16BE(len, 4);
    }
    /** @type {Buffer} **/
    get data() {
        return this.dataBuffer;
    }
    /** @type {Buffer} 
     * @param {Buffer} dataBuffer
     * **/
    set data(dataBuffer) {
        this.dataBuffer = dataBuffer;
        this.length = dataBuffer.byteLength + this.buffer.byteLength;
    }
    get fullBuffer() {
        return Buffer.concat([this.buffer, this.dataBuffer]);
    }
}
module.exports = UDPPacket;