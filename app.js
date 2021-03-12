const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");

const mongoose = require("mongoose");
const channeldb = require("./models/channel");
const messagesColl = require("./models/message");

// const seed = require("./seed");
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
app.use("/public", express.static(path.join(__dirname, "public")));
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
  const { id } = req.params;
  // const channelName= req.body.
  // * we are only showing the channel that we are, should shows all channels on the sidebar
  // * -- remove the filter in find

  await channeldb.find({ _id: id }, (err, data) => {
    if (err) {
      console.log(err);
    }
    res.render("home", { data });
  });
});

app.get("/api/channels", async (req, res) => {
  await channeldb.find({}, (err, data) => {
    if (err) {
     throw(err);
    }
    res.json(data);


  });
});



//*___________________________________________________________________________________________________
//*___________________________________________________________________________________________________
io.on("connection", (socket) => {

  // ******************************************************************
  io.on("chatMessage", async (allMessages) => {
    // * save message to db before emitting to  the browser
    // receive an object from client, the channel name and the message that will be sent to to the database
    let { channel, allMessage } = allMessages;

    console.log(channel);
    console.log(message);

    // take whatever the user types and save it the db 
    let channelMessages = await channeldb.findOne({ _id: channel } );

    console.log(channelMessages);

    // emit to the user after saving it
    socket.emit("outputmsg", messages);
  });
// ***********************************************************************

  console.log("user connected");
  // socket.emit("message", "welcome to slack clone");
  // * find the RIGHT message from db ..................
  channeldb.find().then((messages) => {
    // console.log(messages.conversation);
    // ***** make the channel dynamic, ...... get the the clickd channels messages
    // messages = messages[0].conversation;

    socket.emit("outputmsg", messages);
  });

  
  
  // * send your message to everyone except you
  // listen for chatMessage that is sent from client 
  socket.on("chatMessage", async (msg) => {
    // * save message to db before emitting to  the browser
    // receive an object from client, the channel name and the message that will be sent to to the database
    let { channel, message } = msg;

    console.log(channel);
    console.log(message);

    // take whatever the user types and save it the db 
    let chatMessage = await channeldb.updateOne({ _id: channel },{ $push: { conversation: { message: message } } } );

    // emit to the user after saving it
    io.emit("message", msg);
  });

  // when user disconnects
  socket.on("disconnect", () => {
    console.log("disconnect ");
    io.emit("message", " a user disconnected........");
  });
});



server.listen(3001);
