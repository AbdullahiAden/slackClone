const express = require('express')
const path = require("path")
const http = require('http')
const socketio = require('socket.io')

const mongoose = require("mongoose")

// db connection
const newConv= require("./models/conversation")
const connect = require("./dbconnection")


const app = express()

const server = http.createServer(app)
const io =socketio(server)

//  db config
mongoose.connect("mongodb://localhost:27017/conversation", {useNewUrlParser: true, useUnifiedTopology: true})
    .then(()=>{
        console.log('Connection Open ');
    })
    .catch(err=>{
        console.log('Erorrr');
        console.log(err);
    })


app.use(express.urlencoded({extended:false}))


// EJS
app.set("view engine", "ejs")

// routes

app.get("/", (req , res)=>{
// app.use(express.static(path.join(__dirname, "public")))

    if(newConv){
        newConv.find().exec((err, data)=>{
        if(err){
            console.log(err);
        }
        res.render("home", {data})
        // console.log(data);

    })
    }else{
        console.log('NOthing found in db');
        // res.render("home", {data})

    }

    
    
})

// handle channnel creation 
app.post("/new/channel", (req , res)=>{
    const channelName= req.body.channelInput
    const newChannel = newConv({channelName})

    console.log(newChannel);
    // if there is channel written
    if(channelName){
        newChannel.save()
    }
    
    res.redirect("/")
})

app.get("/channels/:id", (req , res)=>{
    const id = req.params.id
    // const channelName= req.body.
    
    console.log(id);
    // console.log(channelName);

    newConv.find({_id:id}).exec((err, data)=>{
        if(err){
            console.log(err);
        }
        // res.render("home", {data})
        // console.log(data);
        // res.send("you are at--- " + data.channelName + "--- id--- " + id  )

        res.render("home",  {data})


    })

    
    // res.redirect("/")

    // * GET MESSAGES FROM DB 

   
})

// push messages to db 

app.post("/new/message", (req, res)=>{
    // res.send(" message sent ")
    const id = req.query.id
    const newMessage = req.body.newMessage
    console.log(newMessage);
    console.log(id);

    // * SAVE MESSAGES TO DB

    res.send("message sent")

    // newConv.updateOne({_id:id}, {$push:{message:newMessage}})
    // newConv.updateOne({_id:id},{$push:{message:msg}} ,function (err,data) {
    //     if(err)
    //     {
    //         //handle error
    //     }
    //     else{
    //         //handle success
    //     }
    // })
  
})

// get conversation 



io.on('connection', (socket) => {
    console.log("user connected");
    // welcome the user, emits to the single client
    socket.emit("message", "welcome to slack clone")

    // * save message to db 



    // broacast when user connects, emit to all except the connecting user
    socket.broadcast.emit("message", "a user has joined ")

    // * send your message to everyone except you
   
    // listen for chatMessage
    socket.on("chatMessage", msg =>{
        io.emit("message", msg)

        // newConv.updateOne({_id:},{$push:{message:msg}} ,function (err,data) {
        //     if(err)
        //     {
        //         //handle error
        //     }
        //     else{
        //         //handle success
        //     }
        // })

    })

    // when user disconnects
    socket.on("disconnect", ()=>{
    console.log('disconnect ');
    
    io.emit("message"," a user disconnected........" )
    })


})





server.listen(3001)