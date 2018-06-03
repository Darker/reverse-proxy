const readline = require("readline");
require("../../generic/ReadlineAsync");
const ProxyServerAVP2 = require("../ProxyServerAVP2");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


console.log("This file is used for the server. That means\n"
    + "you are running a server on your LAN - or ideally this PC,\n"
    + "and you want to share it over the internet.");



(async () => {
    try {
        if (await rl.chose("Is that what you want to do?")) {

            console.log("You will need IP of the public proxy server.");
            const IP = await rl.question("Enter the IP:");
            console.log("The public proxy server typically listens on\n"
                + "port 80, standard port for webpages. Enter the port\n"
                + "or just press enter to use the port 80");

            const PORT = await rl.question("Enter the port (default 80):") || 80;
            const SRVNAME = await rl.question("Enter a name for your server:");
            console.log("Enter a port that your game server listens on.\n"
                + "By default, that port is 27888. Check your config file\n"
                + "in ServerData directory to see what port is set.");
            const LOCAL_PORT = await rl.question("Local port (default 27888):") || 27888;
            console.log("Enter local server's IP. If it's running on\n"
                + "this computer, just press enter.\n");
            const LOCAL_IP = await rl.question("Local IP (default 127.0.0.1):") || "127.0.0.1";

            console.log("To sum up: \n"
                + "Connecting to server " + IP + ":" + PORT + "\n"
                + "Local server: " + LOCAL_IP+":" + LOCAL_PORT + "\n"
                + "The remoter server name: " + SRVNAME
            )
            const server = new ProxyServerAVP2({ remotePort: PORT, appPort: LOCAL_PORT, remoteAddr: IP, appAddr: LOCAL_IP, serverId: SRVNAME });
            //new ProxyServerAVP2({ remotePort: process.env.PORT, appPort: 27888, remoteAddr: testIP, appAddr: testIP, serverId: "AVP2TEST" });
        }
    }
    catch (e) {
        console.log("ERROR: ", e.stack);
    }
    finally {
        rl.close();
    }
})();
