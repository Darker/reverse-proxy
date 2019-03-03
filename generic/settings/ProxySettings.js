
class ProxySettings {
    /**
     * 
     * @param {ProxySetting[]} settingDefs
     */
    constructor(settingDefs) {
        this.defs = settingDefs;
    }
    /**
     * 
     * @param {ProxySettingValueSource} datasource
     */
    async getValues(datasource) {
        const result = {};
        for (let i = 0, l = this.defs.length; i < l; ++i) {
            const item = this.defs[i];
            const value = await item.getValue(datasource);
            result[item.name] = value;
        }
        return result;
    }
    setValues(dataObj) {
        for (let i = 0, l = this.defs.length; i < l; ++i) {
            const item = this.defs[i];
            if (typeof dataObj[item.name] != "undefined") {
                item.value = dataObj[item.name];
            }
        }
    }
}
class ProxySettingDescription {
    /**
     * Describes textual info for the user, for particular setting
     * @param {string} querytext text to display when asking for the value
     * @param {string} helpText text to display to describe purpose of the value
     */
    constructor(helpText, querytext) {
        this.queryText = querytext;
        this.helpText = helpText;

    }
}
class ProxySettingValueSource {
    constructor() {

    }
    /**
     * 
     * @param {ProxySetting} setting
     */
    async getValue(setting) {
        throw new Error("Pure virtual method call!");
    }
}
class ProxySettingValueSourceReadline extends ProxySettingValueSource {
    /**
     * 
     * @param {ReadLine} rl
     */
    constructor(rl) {
        super();
        this.rl = rl;
    }
    /**
     * 
     * @param {ProxySetting} setting
     */
    async getValue(setting) {
        console.log(setting.description.helpText);

        /** @type {string} **/
        const strvalue = await this.rl.question(
            setting.description.queryText
            + (setting.defaultValue ? " (default " + setting.defaultValue + ")" : "")
            + ":");
        console.log("\n");
        return strvalue;
    }
}
class ProxySettingValueSourceArgv extends ProxySettingValueSource {

    constructor() {
        super();
        // parse argv
        const args = process.argv;
        this.values = {};
        for (let i = 2, l = args.length; (i+1) < l; i+=2) {
            let name = args[i];
            const value = args[i + 1];

            if (name.startsWith("-")) {
                name = name.substr(1);
            }
            this.values[name] = value;
        }
    }
    /**
     * 
     * @param {ProxySettings} settings
     */
    printUsage(settings) {
        console.log("Arguments:");
        for (let i = 0, l = settings.defs.length; i < l; ++i) {
            const item = settings.defs[i];
            console.log("    -"
                + item.name
                + " ".repeat(20 - item.name.length)
                + (item.defaultValue ? " default: " + item.defaultValue+" ":"[REQUIRED] " )
                + item.description.helpText);
        }
    }
    /**
     * 
     * @param {ProxySetting} setting
     */
    async getValue(setting) {
        return this.values[setting.name];
    }
}
/**
 * @class
 * @template SettingType
 * */
class ProxySetting {

    /**
     * 
     * @param {string} name internal name
     * @param {SettingType} defaultValue default value if user enters nothing
     * @param {ProxySettingDescription} description 
     * @param {SettingType} value
     */
    constructor(name, defaultValue, description, value = null) {
        this.name = name;
        this.defaultValue = defaultValue;
        this.description = description;
        this.value = value;
    }
    /**
     * 
     * @param {ProxySettingValueSource} source
     */
    async getValue(source) {
        if (!this.value) {
            this.value = await this.processValue(source.getValue(this));
        }
        if (this.value == null || this.value == "") {
            if (this.defaultValue == null || this.defaultValue == "") {
                throw new Error("Required value not set: " + this.name);
            }
            return this.defaultValue;
        }

        return this.value;
    }

    /**
     * Process (eg. parse) user input
     * @param {string} value
     * @returns {SettingTypee}
     */
    processValue(value) {
        return value;
    }
}
module.exports = {
    Settings: ProxySettings,
    Setting: ProxySetting,
    ValueSource: ProxySettingValueSource,
    ValueSourceReadline: ProxySettingValueSourceReadline,
    ValueSourceArgv: ProxySettingValueSourceArgv,
    Description: ProxySettingDescription
}