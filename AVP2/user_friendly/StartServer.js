const readline = require("readline");
require("../../generic/ReadlineAsync");
const ProxyServerAVP2 = require("../ProxyServerAVP2");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const tryReadFromJSON = require("../../generic/settings/tryReadFromJSON");

const fs = require("fs");



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
            new ProxySettings.Description("Server name: Remote proxy server can host multiple servers.", "Enter a name for your server")
        ),
        new ProxySettings.Setting(
            "LOCAL_PORT",
            27888,
            new ProxySettings.Description("Enter a port that your game server listens on.\n"
                + "By default, that port is 27888. Check your config file\n"
                + "in ServerData directory to see what port is set.", "Local port")
        ),
        new ProxySettings.Setting(
            "LOCAL_IP",
            "127.0.0.1",
            new ProxySettings.Description("Enter local server's IP. If it's running on\n"
                + "this computer, just press enter.\n", "Local IP")
        ),
    ]
);

console.log("This file is used for the server. That means\n"
    + "you are running a server on your LAN - or ideally this PC,\n"
    + "and you want to share it over the internet.");

const SETTINGS_FILE = "StartServer.js.settings.json";
const EXISTING_SETTINGS_PROMISE = new Promise(function (resolve, reject) {
    fs.readFile(SETTINGS_FILE, "utf8", function (err, data) {
        if (err) {
            resolve(null);
        }
        else {
            try {
                resolve(JSON.parse(data));
            }
            catch (e) {
                resolve(null);
            }
        }
    });
});

(async () => {
    try {
        let settings = null;
        let loadedFromSettings = false;
        if (process.argv.length >= 3) {
            const src = new ProxySettings.ValueSourceArgv();
            src.loadValues(SETTING_DEFS);
            try {
                settings = await SETTING_DEFS.getValues(src);
                loadedFromSettings = true;
            } catch (e) {
                console.log("\n");
                src.printUsage(SETTING_DEFS);
                rl.close();
                return;
            }
        }

        if (loadedFromSettings || await rl.chose("Is that what you want to do?")) {

            if (!loadedFromSettings) {
                settings = await tryReadFromJSON(EXISTING_SETTINGS_PROMISE, rl);
                if (settings != null) {
                    loadedFromSettings = true;
                }
            }

            if (settings == null) {
                settings = await SETTING_DEFS.getValues(new ProxySettings.ValueSourceReadline(rl));
            }

            console.log("To sum up: \n"
                + "Connecting to server " + settings.IP + ":" + settings.REMOTE_PORT + "\n"
                + "Local server: " + settings.LOCAL_IP + ":" + settings.LOCAL_PORT + "\n"
                + "The remote server name: " + settings.SRVNAME
            );
            console.log("You can also re-run this configuration using\n    node StartServer.js cser:" + SETTING_DEFS.serialize(settings));

            if (!loadedFromSettings) {
                const saveName = await rl.question("\nIf you want to save these settings,\n enter a name. Otherwise just press enter:");
                if (saveName) {
                    let existing = null;
                    try {
                        existing = await EXISTING_SETTINGS_PROMISE;
                    }
                    catch (e) { };
                    if (typeof existing != "object" || existing == null)
                        existing = {};
                    existing[saveName] = settings;
                    fs.writeFile(SETTINGS_FILE, JSON.stringify(existing, null, 2));
                }
            }



            const server = new ProxyServerAVP2({
                remotePort: settings.REMOTE_PORT,
                appPort: settings.LOCAL_PORT,
                remoteAddr: settings.IP,
                appAddr: settings.LOCAL_IP,
                serverId: settings.SRVNAME
            });
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
