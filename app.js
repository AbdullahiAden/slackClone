const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");

const mongoose = require("mongoose");
const channeldb = require("./models/channel");
const messagesColl = require("./models/message")

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
app.use('/public', express.static(path.join(__dirname, 'public')));
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
  const {id} = req.params;
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


// app.post("/messages/new", (req, res) => {
//   // res.send(" message sent ")
//   const id = req.params.id;

//   const newMessage = req.body;
//   console.log(newMessage);
//   console.log(id + "mmmmmmmmmmmmm");

//   // * SAVE MESSAGES TO DB
// // *****************
// const chatMessage = channeldb.updateOne( { _id: id }, { $push: { message: {msg} } })

// //  * save message to db .........................


// //  const id = req.params.id
// //   let chatMessage =  channeldb.updateOne({_id:id}, {$push:{
// //     conversation:{
// //       message:msg
// //     }
    

// //   }})



//   channeldb.updateOne({ _id: id }, { $push: { message: newMessage } });

//   // res.send("message sent")
//   res.end();

//   // channeldb.updateOne({_id:id},{$push:{message:msg}} ,function (err,data) {
//   //     if(err)
//   //     {
//   //         //handle error
//   //     }
//   //     else{
//   //         //handle success
//   //     }
//   // })
// });




// get conversation

io.on("connection", (socket) => {
  console.log("user connected");
  // welcome the user, emits to the single client
  // socket.emit("message", "welcome to slack clone");

  channeldb.find().then(messages=>{
    // console.log(messages.conversation);
    // ***** make the channel dynamic, ...... get the the clickd channels messages
    messages=messages[0].conversation
    // for(let message in messages ){
    //   console.log(`${message}: ${messages[message]} `);
      
    // }
    socket.emit("outputmsg",messages )
  })

  // broacast when user connects, emit to all except the connecting user
  socket.broadcast.emit("message", "a user has joined ");

  // * send your message to everyone except you
  // listen for chatMessage
  socket.on("chatMessage", async msg => {
    // * save message to db before emitting to  the browser

      let chatMessage = await channeldb.updateOne({_id:"60494383b1ef3018d420ffc5"}, {$push:{
    conversation:{
      message:msg
    }
    

  }})
  // console.log(chatMessage);
    io.emit("message", msg);
    

    //   chatMessage.save().then(()=>{
    //   // emit this message after saving it
    //   io.emit("message", msg);
    // })

    // const newMessage =channeldb.updateOne({_id:"60494383b1ef3018d420ffc5"},{$push:{
    //   message:msg}});

    // console.log(newMessage);
    // if there is channel written
    // if (newMessage) {
    //   newMessage.save().then(()=>{
    //   // emit this message after saving it
    //   io.emit("message", msg);
    // })
    // }
    
    // io.emit("message", msg);

    // const newMessage= channeldb.updateOne({_id:"60494383b1ef3018d420ffc5"},{$push:{message:msg}} ,function (err,data) {
    //     if(err)
    //     {
    //         throw err
    //     }
    //     else{
    //         //handle success
    //         newMessage.save().then(()=>{
    //           // emit this message after saving it
    //           io.emit("message", msg);
    //         })

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
