const ManagementServer = require("./remote/ManagementServer");
const ProxyServer = require("./local/ProxyServer");
const ProxyServerUDP = require("./local/ProxyServerUDP");

const socket_io_port = process.argv[2] * 1;
if (socket_io_port * 1 != socket_io_port) {
    throw new Error("Port for socket IO must be the first argument!");
}
else {
    socket_io_port = socket_io_port * 1;
}
const tcp_proxy_port = process.argv[3] * 1;
if (tcp_proxy_port * 1 != tcp_proxy_port) {
    throw new Error("Port for TCP proxy server must be the second argument!");
}
else {
    tcp_proxy_port = tcp_proxy_port * 1;
}

const remote = new ManagementServer(socket_io_port, tcp_proxy_port);


//const local = new ProxyServer({
//    appPort: 9990,
//    remoteAppPort: 9991,
//    remoteManPort: 16660,
//    remotePort: process.env.PORT,
//    remoteAddr: "127.0.0.1"
//});

//const localUDP = new ProxyServerUDP({
//    remoteAppPort: 9991,
//    remoteManPort: 16660,
//    remotePort: process.env.PORT,
//    remoteAddr: "127.0.0.1",
//    appPort: 27888
//})