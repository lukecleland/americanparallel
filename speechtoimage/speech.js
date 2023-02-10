// const { Configuration, OpenAIApi } = require("openai");
// const configuration = new Configuration({
//   apiKey: "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",
// });
// const openai = new OpenAIApi(configuration);

// const express = require("express");
// var cors = require("cors");
// const https = require("https");
// const fs = require("fs");

// const app = express();

// app.use(cors());

// // Read in the SSL/TLS certificates and private key
// const privateKey = fs.readFileSync(
//   "/etc/letsencrypt/live/americanparallel.com/privkey.pem",
//   "utf-8"
// );
// const certificate = fs.readFileSync(
//   "/etc/letsencrypt/live/americanparallel.com/cert.pem",
//   "utf-8"
// );
// const credentials = { key: privateKey, cert: certificate };

// var http = require("https").server(credentials, app);
// var io = require("socket.io")(http);

// const PORT = process.env.PORT || 4002;

// server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));

// io.on("connection", (socket) => {
//   socket.on("message", async (message) => {
//     console.log(message);
//     const response = await openai.createImage({
//       prompt: message,
//       n: 1,
//       size: "256x256",
//     });

//     io.emit("image", response.data.data[0].url);
//   });
// });

// // use express to server the index.html file located in this directory
// //app.use(express.static(__dirname));

var app = require("express")();
var https = require("https");
var fs = require("fs");

// path to certs
var path = "/etc/letsencrypt/live/americanparallel.com";

// create server
var server = https.createServer(
  {
    key: fs.readFileSync(path + "/privkey.pem", "utf8"),
    cert: fs.readFileSync(path + "/cert.pem", "utf8"),
    ca: fs.readFileSync(path + "/chain.pem", "utf8"),
  },
  app
);

// start listening
server.listen(4002, function () {
  console.log("listening on *:4002");
});

// io client
const io = require("socket.io")(server, {
  cors: {
    origin: "https://americanparallel.com",
    methods: ["GET", "POST"],
    allowedHeaders: ["*"],
    credentials: true,
  },
});

// testing connection
io.on("connection", function (socket) {
  socket.on("test", function (data) {
    socket.emit("ackmessage", {
      msg: "data",
      key: "222",
    });
    console.log("connected");
  });
});
