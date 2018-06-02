const socketioclient = require("socket.io-client");
const io = require("socket.io");

const server = io.listen(process.env.PORT);

server.on("connection", (client) => {
    console.log("[SERVER] Client connected!");
    client.emit("chat", "Bye!");
    client.on("bye", () => {
        console.log("[SERVER] Client goodbye'd us. Closing server.");
        client.disconnect();
        server.close();
    })
});

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
//client.connect();