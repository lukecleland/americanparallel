const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: "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",
});
const openai = new OpenAIApi(configuration);

var server = require("https").createServer(app);
const express = require("express");
var cors = require("cors");

const app = express();

app.use(cors());

var fs = require("fs");

const privateKey = fs.readFileSync(
  "/etc/letsencrypt/live/americanparallel.com/privkey.pem"
);
const certificate = fs.readFileSync(
  "/etc/letsencrypt/live/americanparallel.com/fullchain.pem"
);
const credentials = {
  key: privateKey,
  cert: certificate,
};
var server = require("https").createServer(credentials, app);
const socketio = require("socket.io");

const io = socketio(server);

const PORT = process.env.PORT || 3002;

server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));

io.on("connection", (socket) => {
  socket.on("message", async (message) => {
    console.log(message);
    const response = await openai.createImage({
      prompt: message,
      n: 1,
      size: "256x256",
    });

    io.emit("image", response.data.data[0].url);
  });
});

// use express to server the index.html file located in this directory
//app.use(express.static(__dirname));
