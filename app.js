const ManagementServer = require("./remote/ManagementServer");
const ProxyServer = require("./local/ProxyServer");
const ProxyServerUDP = require("./local/ProxyServerUDP");

const remote = new ManagementServer(process.env.PORT, 80);


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