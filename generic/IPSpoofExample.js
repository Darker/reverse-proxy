
const raw = require("raw-socket");
const UDPPacket = require("../generic/UDPPacket");
const IPV4Packet = require("../generic/IPV4Packet");

var socket = raw.createSocket({ protocol: raw.Protocol.UDP });

socket.on("message", function (buffer, source) {
    console.log("received " + buffer.length + " bytes from " + source);
});
// UDPPacket and IPV4 packet are classes that I wrote in order to 
// generate the UDP and IPV4 byte data
const packet = new UDPPacket();
packet.srcPort = 62458;
packet.dstPort = 27888;
packet.data = statusRequestBuffer;
const buf = packet.fullBuffer;
const ipv4packet = new IPV4Packet();
ipv4packet.payloadBuffer = buf;

// I send the message form several IPs, but only mine works
//const iprand = "172.20.110.";
//let ipincrement = 75 * 2;
// my actual IP right now
ipv4packet.srcAddr = "172.20.110.79";
ipv4packet.dstAddr = "127.0.0.1";


setInterval(() => {
    // Try to send it from another IP
    //ipv4packet.srcAddr = iprand + Math.round((++ipincrement)/2);
    const ipv4buf = ipv4packet.fullBuffer;
    socket.send(ipv4buf, 0, ipv4buf.length, ipv4packet.dstAddr, function (error, bytes) {
        // I'm not sure what does this exactly do,
        // I found it on the internet ¯\_(ツ)_/¯
        socket.setOption(
            raw.SocketLevel.IPPROTO_IP,
            raw.SocketOption.IP_HDRINCL,
            new Buffer([0x01, 0x00, 0x00, 0x00]),
            4
        );
    },
        function (error, bytes) {
            // always prints that bytes were sent
            if (error)
                console.log(error.toString());
            else
                console.log(bytes, " bytes sent!");
        }
    );
}, 700)

//const spoofSocket = dgram.createSocket("udp4");

//spoofSocket.bind(27889/*, "192.168.3.22"*/);

