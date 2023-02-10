const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: "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",
});
const openai = new OpenAIApi(configuration);

const express = require("express");
var cors = require("cors");
const https = require("https");
const fs = require("fs");

const app = express();

app.use(cors());

// Read in the SSL/TLS certificates and private key
const privateKey = fs.readFileSync(
  "/etc/letsencrypt/live/americanparallel.com/privkey.pem",
  "utf-8"
);
const certificate = fs.readFileSync(
  "/etc/letsencrypt/live/americanparallel.com/cert.pem",
  "utf-8"
);
const credentials = { key: privateKey, cert: certificate };

var http = require("https").Server(credentials, app);
var io = require("socket.io")(http);

const PORT = process.env.PORT || 4002;

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
