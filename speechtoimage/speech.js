const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: "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",
});
const openai = new OpenAIApi(configuration);

const express = require("express");
var cors = require("cors");
const app = express();

app.use(cors());

const https = require("https");
const fs = require("fs");

// Read in the SSL/TLS certificates and private key
const privateKey = fs.readFileSync(
  "/etc/letsencrypt/live/americanparallel.com/privkey.pem",
  "utf-8"
);
const certificate = fs.readFileSync(
  "/etc/letsencrypt/live/americanparallel.com/fullchain.pem",
  "utf-8"
);
const credentials = { key: privateKey, cert: certificate };

// Create a HTTPS server using the certificates and private key
const server = https.createServer(credentials, app);

// Start a socket.io instance using the HTTPS server
const io = require("socket.io")(server);

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

// Start the HTTPS server on a specified port
const port = 4002;
server.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

// use express to server the index.html file located in this directory
//app.use(express.static(__dirname));
