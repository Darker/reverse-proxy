const readline = require("readline");



var oldCreateIface = readline.createInterface;
readline.createInterface = function () {
    var iface = oldCreateIface.apply(this, arguments);

    var oldQuestion = iface.question;
    iface.question = function (question) {
        //console.log("QUESTION: " + question);
        return new Promise(function (resolve, reject) {
            try {
                oldQuestion.call(iface, question, (result) => {
                    resolve(result);
                });
            }
            catch (e) {
                reject(e);
            }
        });
    }
    iface.chose = async function (question) {
        const response = await iface.question(question + " [y/n]");
        return response.toLowerCase().startsWith("y");
    };
    return iface;
}
