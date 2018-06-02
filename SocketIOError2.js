const socketioclient = require("socket.io-client");
const io = require("socket.io");
const net = require("net");

const http_server = net.createServer();
// this didn't work too. Exxentially socket io does not work at all
//   io = io.listen(typeof port == "number" ? port : process.env.PORT);
console.log("Attaching socket IO to HTTP server.");
const ioserv = io(http_server);
/// The port does open
http_server.listen(typeof port == "number" ? port : process.env.PORT,
    () => {
        console.log('IO HTTP server listening on port', http_server.address().port)
    });
/// The connection listener is triggered, but IO doesn't bother 
/// replying or something
http_server.on("connection", (req, res) => {
    console.log("Connection received, but IO ignores it.")
});
// Never happens
ioserv.on("connection", (socket) => {
    console.log("[SERVER] Client connected!");
    client.emit("chat", "Bye!");
    client.on("bye", () => {
        console.log("[SERVER] Client goodbye'd us. Closing server.");
        client.disconnect();
        server.close();
    })
});

ioserv.on("error", () => {
    console.error("[SERVER] IO Error!")
})


const client = socketioclient("http://127.0.0.1:" + process.env.PORT);
client.once("connect", () => {
    console.log("[CLIENT] Connected to remote server.")
});
client.on("chat", (msg) => {
    console.log("[CLIENT] Server sends message:", msg);
    if (msg.toLowerCase().indexOf("bye") != -1) {
        client.emit("bye");
    }
});
client.on("disconnected", () => {
    console.log("[CLIENT] Disconnected.");
})
client.on("error", () => {
    console.error("[CLIENT] Socket IO connection error.")
});