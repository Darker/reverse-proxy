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

const original = {
    SRVNAME: "TEST",
    IP: "antenaletna.cz",
    DDD: "ignored",
    LOCAL_PORT: 13232
};
const serialized = SETTING_DEFS.serialize(original);
console.log(serialized);
const deserialized = SETTING_DEFS.deserialize(serialized);
console.log(deserialized);

(async () => {
    const loader = new ProxySettings.ValueSourceArgv(["", "", "cser:" + serialized]);
    loader.loadValues(SETTING_DEFS);
    console.log(await SETTING_DEFS.getValues(loader));
})();
