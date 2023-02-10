const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: `${process.env.OPENAI_KEY}`,
});
const openai = new OpenAIApi(configuration);

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

io.on("connection", (socket) => {
  socket.on("message", async (message) => {
    console.log(message);
    const response = await openai.createImage({
      prompt: message,
      n: 1,
      size: "256x256",
    });
    // .catch((err) => {
    //   console.log(err);
    // });

    io.emit("image", response.data.data[0].url);
  });
});
