const orderedValues = [
    "gamename",
    "gamever",
    "location",
    "hostname",
    "hostport",
    "mapname",
    "gametype",
    "gamemode",
    "numplayers",
    "maxplayers",
    "lock",
    "ded",
    "maxa",
    "maxm",
    "maxp",
    "maxc",
    "frags",
    "score",
    "time",
    "rounds",
    "lc",
    "hrace",
    "prace",
    "ratio",
    "srace",
    "mrace",
    "drace",
    "dlive",
    "arace",
    "alive",
    "speed",
    "respawn",
    "damage",
    "hitloc",
    "ff",
    "mask",
    "class",
    "cscore",
    "final",
    "queryid"
]

class AVP2ServerInfo {
    constructor(from) {
        this.gamename = "avp2";
        this.gamever = "1.0.9.1";
        this.location = "0";
        this.hostname = "[INTERNET] Node.js server";
        this.hostport = "27888";
        this.mapname = "Ur gon die";
        this.gametype = "DM";
        this.gamemode = "openplaying";
        this.numplayers = "0";
        this.maxplayers = "8";
        this.lock = "0";
        this.ded = "1";
        this.maxa = "5";
        this.maxm = "5";
        this.maxp = "5";
        this.maxc = "5";
        this.frags = "30";
        this.score = "0";
        this.time = "600";
        this.rounds = "0";
        this.lc = "0";
        this.hrace = "0";
        this.prace = "0";
        this.ratio = "0";
        this.srace = "0";
        this.mrace = "0";
        this.drace = "0";
        this.dlive = "0";
        this.arace = "0";
        this.alive = "0";
        this.speed = "100";
        this.respawn = "100";
        this.damage = "100";
        this.hitloc = "1";
        this.ff = "1";
        this.mask = "1";
        this.class = "1";
        this.cscore = "0";
        this.final = "";
        this.queryid = "2.1";

        
        if (typeof from == "string") {
            this.fromString(from);
        }
        else if (typeof from == "object" && from != null) {
            this.fromObject(from);
        }
        
    }
    /**
     * 
     * @param {string} stringInput
     */
    fromString(stringInput) {
        const valarray = stringInput.split("\\");
        for (let i = 1, l = valarray.length-1; i < l; i+=2) {
            const name = valarray[i];
            const value = valarray[i + 1];

            this[name] = value;
        }
    }
    fromObject(obj) {
        for (var name in obj) {
            this[name] = obj[name];
        }
    }
    toString() {
        var result = "";
        for (let i = 0, l = orderedValues.length; i < l; ++i) {
            const valname = orderedValues[i];
            result += "\\" + valname + "\\" + this[valname];
        }
        return result + "\\";
    }
}
module.exports = AVP2ServerInfo;