/**
 * 
 * @param {string} ip
 * @param {Buffer} buffer
 * @param {number} offset
 */
function ipv4tobuffer(ipv4string, buffer, offset = 0) {
    if (!(buffer instanceof Buffer)) {
        buffer = new Buffer(4);
    }

    const octets = ipv4string.split(".");
    for (let i = 0; i < 4; ++i) {
        const item = Math.max(0, Math.min(octets[i], 255));
        buffer.writeUInt8(item, offset+i);
    }
    return buffer;
}
function ipv4frombuffer(buffer, offset = 0) {
    return buffer.readUInt8(offset) + "." + buffer.readUInt8(offset + 1) + "." + buffer.readUInt8(offset + 2) + "." + buffer.readUInt8(offset+3);
}
module.exports = {
    ipv4tobuffer,
    ipv4frombuffer

}