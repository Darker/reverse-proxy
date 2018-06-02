const sockutil = require("./RawSocketUtil");


class IPV4Packet {
    constructor() {
        this.ipv4header = new Buffer([
/* 0 */      0b01000101,                // IP: Version (0100 = 4 = IPv4), header length = 0101=5=20bytes
/* 1 */      0x00,                      // IP: Differentiated Services Field
/* 2 */      0x00, 0x00,                // IP: Total Length
/* 4 */      0x00, 0x00,                // IP: Identification
/* 6 */      0b01000000,                // IP: Flags (2nd bit: don't fragment, 3rdbit: more fragments)
/* 7 */      0x00,                      // IP: Fragment Offset
/* 8 */      0xFF,                      // IP: TTL (0x40 is 64)
/* 9*/       17,                        // IP: protocol (ICMP=1, IGMP=2, TCP=6, UDP=17, static value)
/* 10*/      0xFF, 0xFF,                // IP: checksum for IP part of this packet
/* 12*/      0x00, 0x00, 0x00, 0x00,    // IP: ip src
/* 16*/      0x00, 0x00, 0x00, 0x00,    // IP: ip dst
        ]);
        /** @type {Buffer} **/
        this._payloadBuffer = null;
        this.ipv4header.writeUInt16BE((Math.random() * 0xffff) | 0, 4);

    }
    /** @type {number} **/
    get protocol() {
        return this.ipv4header.readUInt8(9);
    }
    set protocol(value) {
        this.ipv4header.writeUInt8(value, 9);
    }

    /** @type {number} **/
    get totalLength() {
        return this.ipv4header.readUInt16BE(2);
    }
    set totalLength(value) {
        return this.ipv4header.writeUInt16BE(value, 2);
    }

    /** @type {Buffer} **/
    get payloadBuffer() {
        return this._payloadBuffer;
    }
    set payloadBuffer(value) {
        this._payloadBuffer = value;
        this.totalLength = (value.byteLength + this.ipv4header.byteLength);
    }

    /** @type {string} **/
    get srcAddr() {
        return sockutil.ipv4frombuffer(this.ipv4header, 12)
    }
    set srcAddr(value) {
        sockutil.ipv4tobuffer(value, this.ipv4header, 12)
    }

    /** @type {string} **/
    get dstAddr() {
        return sockutil.ipv4frombuffer(this.ipv4header, 16)
    }
    set dstAddr(value) {
        sockutil.ipv4tobuffer(value, this.ipv4header, 16)
    }
    get fullBuffer() {
        return Buffer.concat([this.ipv4header, this._payloadBuffer]);
    }
}

module.exports = IPV4Packet;