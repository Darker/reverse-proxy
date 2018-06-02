const ProxyServerAVP2 = require("./ProxyServerAVP2");
const AVP2ClientProxy = require("./AVP2ClientProxy");

const ManagementServer = require("../remote/ManagementServer");

const remote = new ManagementServer(process.env.PORT*1, 16660);

let tmp1, tmp2;
//const testIP = "127.0.0.1";
const testIP = "192.168.3.10";

setTimeout(() => {
    const serv_proxy = tmp1 = new ProxyServerAVP2({ remotePort: process.env.PORT, appPort: 27888, remoteAddr: testIP, appAddr: testIP, serverId: "AVP2TEST" });
    const client_proxy = tmp2 = new AVP2ClientProxy(testIP, "AVP2TEST", process.env.PORT*1, 27880);
}, 500);

