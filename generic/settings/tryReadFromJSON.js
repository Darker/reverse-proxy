async function tryReadFromJSON(jsonDataPromise, readline) {
    try {
        const existing = await jsonDataPromise;
        if (existing) {
            const names = [];
            for (var name in existing) {
                if (typeof existing[name] == "object") {
                    names.push(name);
                }
            }
            if (names.length > 0) {
                const longestNameLen = names.reduce((prev, cur) => {
                    return prev.length > cur.length ? prev : cur;
                }).length;
                const columnSpaceReserve = longestNameLen + 1;

                const max_column = 80;
                const values_per_col = max_column / (longestNameLen + 3);
                let table = "";
                for (let i = 0, l = names.length; i < l; ++i) {
                    const name = names[i];
                    table += name;
                    const len = name.length;
                    table += " ".repeat(columnSpaceReserve - len);

                    if ((i + 1) % values_per_col == 0) {
                        table += "\n";
                    }
                }
                console.log("You have some saved configurations.\nDo you want to load one of them?");
                console.log(table);
                const selectedName = await readline.question("Enter a name to load config,\nor just press enter to skip:");
                if (typeof existing[selectedName] == "object") {
                    return existing[selectedName];
                }
                else {
                    return null;
                }
            }
        }
    }
    catch (e) {
        console.log("Error loading saved settings: " + e.message);
        return null;
    };
} 

module.exports = tryReadFromJSON;