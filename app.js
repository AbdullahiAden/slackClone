const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");

const mongoose = require("mongoose");

// db connection

const channeldb = require("./models/channel");
const connect = require("./seed");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

//  db config
mongoose
  .connect("mongodb://localhost:27017/channel", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    // console.log("Connection Open ");
  })
  .catch((err) => {
    console.log("Erorrr");
    console.log(err);
  });

app.use(express.urlencoded({ extended: false }));

// EJS
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

// routes

app.get("/", async (req, res) => {
  await channeldb.find({}, (err, data) => {
    if (channeldb) {

      res.render("home", { data });
    } else {
      console.log(err);
    }
  });

  // if(channeldb){
  //     channeldb.find().exec((err, data)=>{
  //     if(err){
  //         console.log(err);
  //     }
  //     res.render("home", {data})
  //     // console.log(data);
  // })
  // }else{
  //     console.log('NOthing found in db');
  //     // res.render("home", {data})
  // }
});

// handle channnel creation
app.post("/channels/new", (req, res) => {
  const channelName = req.body.channelInput;
  const newChannel = channeldb({ channelName });

  console.log(newChannel);
  // if there is channel written
  if (channelName) {
    newChannel.save();
  }
  res.redirect("/");
});

app.get("/channels/:id", async (req, res) => {
  const id = req.params.id;
  // const channelName= req.body.
  // * we are only showing the channel that we are, should shows all channels on the sidebar
  // * -- remove the filter in find

  await channeldb.find({ _id: id }, (err, data) => {
    if (err) {
      console.log(err);
    }
    res.render("home", { data });
  });
  // res.redirect("/")

  // * GET MESSAGES FROM DB
});

// push messages to db
// app.get("/messages/new", (req, res) => {});








app.post("/messages/new", (req, res) => {
  // res.send(" message sent ")
  const id = req.params.id;

  const newMessage = req.body;
  console.log(newMessage);
  console.log(id + "mmmmmmmmmmmmm");

  // * SAVE MESSAGES TO DB
  channeldb.updateOne({ _id: id }, { $push: { message: newMessage } });

  // res.send("message sent")
  res.end();

  // channeldb.updateOne({_id:id},{$push:{message:msg}} ,function (err,data) {
  //     if(err)
  //     {
  //         //handle error
  //     }
  //     else{
  //         //handle success
  //     }
  // })
});




// get conversation

io.on("connection", (socket) => {
  console.log("user connected");
  // welcome the user, emits to the single client
  socket.emit("message", "welcome to slack clone");

  // * save message to db

  // broacast when user connects, emit to all except the connecting user
  socket.broadcast.emit("message", "a user has joined ");

  // * send your message to everyone except you

  // listen for chatMessage
  socket.on("chatMessage", (msg) => {
    io.emit("message", msg);

    // channeldb.updateOne({_id:},{$push:{message:msg}} ,function (err,data) {
    //     if(err)
    //     {
    //         //handle error
    //     }
    //     else{
    //         //handle success
    //     }
    // })
  });

  // when user disconnects
  socket.on("disconnect", () => {
    console.log("disconnect ");

    io.emit("message", " a user disconnected........");
  });
});

server.listen(3001);
