const readline = require("readline");
require("../../generic/ReadlineAsync");
const AVP2ClientProxy = require("../AVP2ClientProxy");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const ProxySettings = require("../../generic/settings/ProxySettings");

const SETTING_DEFS = new ProxySettings.Settings(
    [
        new ProxySettings.Setting(
            "IP",
            null,
            new ProxySettings.Description("Remote IP: You will need IP of the public proxy server.", "Enter the IP")
        ),
        new ProxySettings.Setting(
            "REMOTE_PORT",
            80,
            new ProxySettings.Description("Remote port: The public proxy server typically listens on\n"
                + "port 80, standard port for webpages. Enter the port", "Enter the port")
        ),
        new ProxySettings.Setting(
            "SRVNAME",
            null,
            new ProxySettings.Description("Server name: Remote proxy server can host multiple servers.", "Enter a name of the server")
        ),
        new ProxySettings.Setting(
            "LOCAL_PORT",
            27888,
            new ProxySettings.Description("Enter a port the game server should listen on.\n"
                + "By default, that port is 27888.", "Local port")
        ),
    ]
);


console.log("This file is used for the client - that is,\n"
    + "the one who wants to connect to a server.\n");


(async () => {
    try {
        if (await rl.chose("Is that what you want to do?")) {

            console.log("You will need IP of the public proxy server.");
            const IP = await rl.question("Enter the IP:");
            console.log("The public proxy server typically listens on\n"
                + "port 80, standard port for webpages. Enter the port\n"
                + "or just press enter to use the port 80");

            const PORT = await rl.question("Enter the port (default 80):") || 80;
            console.log("IP and port are same for all game servers\n"
                + "running under one proxy server. What is unique\n"
                + "for each game server is it's name. Host defines that name.");
            const SRVNAME = await rl.question("Enter the server name:");
            console.log("Lastly, you need to select a port that the game will\n"
            +"connect to. If you don't know, just press enter.");
            const LOCAL_PORT = await rl.question("Local port (default 27888):") || 27888;
            console.log("To sum up: \n"
                + "Connecting to server " + IP + ":" + PORT + "\n"
                + "Local server: 0.0.0.0:" + LOCAL_PORT + "\n"
                + "The remoter server name: " + SRVNAME
            )
            const proxy = new AVP2ClientProxy(IP, SRVNAME, PORT, LOCAL_PORT);
        }
    }
    catch (e) {
        console.log("ERROR: ", e.stack)
    }
    finally {
        rl.close();
    }
})();
