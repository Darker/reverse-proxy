
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
    hasDef(defName) {
        return this.defs.find((def) => {
            return def.name == defName;
        }) != null;
    }
    /**
     * Returns a definition or null
     * @param {any} defName
     */
    getDef(defName) {
        return this.defs.find((def) => {
            return def.name == defName;
        });
    }

    getDefaultValue(defName) {
        const def = this.getDef(defName);
        if (def) {
            return def.defaultValue;
        }
        else {
            return null;
        }
    }
    
    /**
     * 
     * @param {object} values
     */
    serialize(values) {
        if (typeof values !== "object") {
            values = {};
        }
        ///** @type {[string,any][]} **/
        //const valuesList = Object.entries(values);

        ///** @type {[string,string][]} **/
        //const valuesArr = valuesList
        //    .filter((n) => {
        //        this.hasDef(n[0]);
        //    })
        //    .map((n) => {
        //        return [n[0], n[1].toString()]
        //    });
        //valuesArr.sort((pairA, pairB) => {
        //    return pairA[0].localeCompare(pairB[0]);
        //});
        //console.log("Sorted value pairs: " + valuesArr);

        const valueNames = this.defs.map((def) => def.name);
        valueNames.sort();

        // build result
        let result = "";
        for (const name of valueNames) {
            if (typeof values[name] !== "undefined" && values[name]!=null) {
                const value = values[name].toString();
                result += value.length;
                result += ":";
                result += value;
            }
            else {
                result += "0:";
            }
        }
        return result;
    }
    /**
     * 
     * @param {string} valuesString
     * @returns {object} parsed values based on their names
     * @throws error if serialized data is incomplete or required param is missing
     */
    deserialize(valuesString) {
        const valueNames = this.defs.map((def) => def.name);
        valueNames.sort();
        const result = {};
        let charOffset = 0;
        for (const name of valueNames) {
            if (charOffset >= valuesString.length) {
                throw new Error("Serialized data incomplete!");
            }

            const nextColon = valuesString.indexOf(":", charOffset);
            const numberLength = nextColon - charOffset;
            const valueSize = 1 * valuesString.substr(charOffset, numberLength);
            charOffset += numberLength;
            // Also move to skip colon
            charOffset += 1;
            if (valueSize > 0) {
                const value = valuesString.substr(charOffset, valueSize);
                result[name] = value;
            }
            else {
                const defaultValue = this.getDefaultValue(name);
                if (defaultValue) {
                    result[name] = defaultValue;
                }
                else {
                    throw new Error("Required property " + name + " was not serialized!");
                }
            }
            charOffset += valueSize;
        }
        return result;
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
     * @param {Proxy}
     */
    async getValue(setting, settings) {
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
    /**
     * 
     * @param {string[]} args
     */
    constructor(args) {
        super();
        // parse argv
        args = args || process.argv;
        this.args = args;
        this.values = null;


    }
    /**
     * 
     * @param {ProxySettings} settings
     */
    loadValues(settings) {
        if (this.values == null) {
            if (this.args.length < 3) {
                this.values = {};
            }
            else if (this.args[2].startsWith("cser:")) {
                this.values = settings.deserialize(this.args[2].substr(5));
            }
            else {
                this.values = {};
                for (let i = 2, l = this.args.length; (i + 1) < l; i += 2) {
                    let name = this.args[i];
                    const value = this.args[i + 1];

                    if (name.startsWith("-")) {
                        name = name.substr(1);
                    }
                    this.values[name] = value;
                }
            }
        }
        return this.values;
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
     * @returns {SettingType}
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