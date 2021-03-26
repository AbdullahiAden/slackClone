const express = require("express");
const app = express();
const path = require("path");
const http = require("http");
const socketio = require("socket.io");

const mongoose = require("mongoose");

const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("connect-flash");
const session = require("express-session");

require("./config/passport")(passport);

// models
const channeldb = require("./models/channel");
const Usersdb = require("./models/user");
const Dmdb = require("./models/dm");

const fileUpload = require("express-fileupload");

//create  uploads folder
app.use(fileUpload({createParentPath: true,}));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));


const { ensureAuthenticated } = require("./config/auth");

const server = http.createServer(app);
const io = socketio(server);

//  db config
mongoose
  .connect("mongodb://localhost:27017/channel", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connection Open ");
  })
  .catch((err) => {
    console.log("Erorrr");
    console.log(err);
  });

app.use(express.urlencoded({ extended: false }));

// EJS
app.set("view engine", "ejs");
app.use("/public", express.static(path.join(__dirname, "public")));

// Sessions
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// connect Flash
app.use(flash());

// global veriable . diff colors for diff msges
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

// ------ ROUTES -----------------------------------------------------------

// signup
app.get("/", async (req, res) => {
  res.render("signup");
  
});

// handle signup
app.post("/user/register", (req, res) => {
  const { name, email, password } = req.body;
  let errors = [];

  if (!name || !email || !password) {
    errors.push({ msg: "Please enter all fields" });
  }

  if (password.length < 6) {
    errors.push({ msg: "Password must be at least 6 characters" });
  }

  if (errors.length > 0) {
    res.render("signup", { errors, name, email, password });

    // if there are errors in filling form, we search db for such email
  } else {
    Usersdb.findOne({ email: email }).then((user) => {
      if (user) {
        errors.push({ msg: "Email already exists" });
        res.render("signup", { errors, name, email, password });

        // if email is not in db, instanciate user
      } else {
        const newUser = new Usersdb({ name, email, password });

        // hash the password
        bcrypt.hash(password, 10, function (error, hash) {
          // Store hashed  password in db
          newUser.password = hash;

          // save user to db after hashing and pass redirect
          newUser
            .save()
            .then((value) => {
              req.flash("success_msg", "You have been registered, login!");
              res.redirect("/user/login");
            })
            .catch((error) => console.log(error));
        });
      }
    });
  }
});

// Login
app.get("/user/login", (req, res) => {
  res.render("login");
});

app.post("/user/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/channels",
    failureRedirect: "/user/login",
    failureFlash: true,
  })(req, res, next);
});

// Logout

app.get('/user/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out')
  res.redirect('/user/login');
});

app.get("/channels", ensureAuthenticated, async (req, res) => {
  // console.log(req.user);
  let ALL= await channeldb.find({}, (err, data) => {
    if (channeldb) {
      Usersdb.find({}, (err, allUsers) => {
        if (Usersdb) {
          res.render("home", { data, user: req.user, allUsers: allUsers });
        } else {
          res.render("home", { data, user: req.user });
        }
      });
    } else {
      console.log(err);
    }
  }).populate("user");
 
});

// handle channnel creation
app.post("/channels/new", ensureAuthenticated , (req, res) => {
  const channelName = req.body.channelInput;
  const newChannel = channeldb({ channelName });

  console.log(newChannel);
  // if there is channel written
  if (channelName) {
    newChannel.save();
  }
  res.redirect("/channels");
});

// get the conversation of specific channel
app.get("/channels/:id",ensureAuthenticated , async (req, res) => {
  const { id } = req.params;

   await channeldb.find({ _id: id })
  .populate("conversation.user")
  .exec((err, poppedChannel)=>{
    if(err){
      console.log(err);
    }
    // console.log(poppedChannel);
    res.render("home", { data: poppedChannel, user: req.user });
    
  });
   
});

// delete messages
app.get("/channels/:id/delete", ensureAuthenticated, async (req,res)=>{
  // message id 
  const {id}= req.params
  
    // find the _id in coversation arr that matches the clicked one and pull it  
    await channeldb.updateOne(
    { "conversation._id": id  },
    {$pull: {conversation: {_id: id }}} )
    .then((err, messageObj)=>{
    if(err){
      console.log(err);
    }
    // redirect back to the page the request came from. 
    res.redirect("back")
  });

})

// *DMS

app.get("/dm/:id", ensureAuthenticated,  async (req,res)=>{
  const {id} = req.params
  const loggedUser = req.user
  // *check if there is any messages bewtween clicked user and logged in user( req.user)

  // $or: [{ userTo:id , "conversation.userFrom":loggedUser._id}, {userTo: loggedUser._id , "conversation.userFrom":id }]
  // await Dmdb.find( {userTo:id , "conversation.userFrom":loggedUser._id})
  await Dmdb.find({$or: [{ userTo:id , "conversation.userFrom":loggedUser._id}, {userTo: loggedUser._id , "conversation.userFrom":id }] } )
  .populate("userTo ")
  .populate("conversation.userFrom ")
  .exec((err, popDm)=>{
    if(err){
      console.log(err);
    }
    
    // console.log(popDm);

    // *check if there is NO document of the clikced user and the logged in user 
    // * check by if userTo === logged in user or userFrom === logged in user

    // if the arr is emppty
    if( popDm.length<1){
      const newDm = new Dmdb({userTo: id,conversation: [{userFrom: loggedUser}] })

      newDm.save().then(dm=>{
            console.log(dm);
        })
        .catch(err=>{
            console.log(err);
        })

    }
    // console.log(req.user._id + " reqUUUU");
    // console.log(id + " reqPAR");

        res.render("home", { dmUsers: popDm, reqUser: req.user , reqParams:id});

    
  });
  
})


// mentions - only for channels NOT DMS...

app.get("/mentions/:id", ensureAuthenticated, async (req, res)=>{
  const {id}= req.params
  // loop though db and get the messages of the logged in user

  // mentions from channels 
  await channeldb.find({"conversation.user":id})
  .populate('conversation.user')
  .exec((err, userMentions)=>{
    if(err){
      console.log(err);
    }

   
    res.render("home", {mentions:userMentions, reqUser: req.user , reqParams:id} );
    
  });

  // * dms 

})
//serves json
app.get("/api/channels", async (req, res) => {
  await channeldb.find({})
  .populate('conversation.user')
  .exec((err, poppedUser)=>{
    if(err){
      console.log(err);
    }
    console.log(poppedUser[0].conversation);
    res.json(poppedUser);
    
  });
  
});


// upload profile pic
app.get("/profile/upload", ensureAuthenticated, (req, res) => {
  res.render("imageIndex");
});
app.post("/profile/upload", async (req, res) => {
  try {
    if (req.files) {
      let profile_pic = req.files.profile_pic;

      // console.log(profile_pic);

      let file_name = `./uploads/${profile_pic.name}`;

      // move uploaded file to upload dir
      profile_pic.mv(file_name);

      // res.render("home", { images: [file_name] });

      let userProfilePic = await Usersdb.updateOne(
        { _id: req.user.id },
        { profilePic: profile_pic.name }
      );

      res.redirect("/channels");
    } else {
      res.end(`<h1>No file uploaded</h1>`);
    }
  } catch (err) {
    res.send(err);
  }
});




// .................... SOCKETS  ........................
// Channels Sockets ......

io.on("connection", (socket) => {
  // find all channels from db and send to frontend, there will checked
  channeldb.find()
  .populate("conversation.user")
  .exec((err,allChannels) => {
    if(err){
      console.log(err);
    }
    socket.emit("outputmsg", allChannels);
  });

  // send your message to everyone except you -- listen for chatMessage that is sent from client
  // save message to db before emitting to  the browser
  socket.on("chatMessage", async (msg) => {
    // receive an object from client, the channel name and the message that will be sent to to the database
    let { channel, message, user } = msg;
    // trim to remove space from the string
    let trimmedUserId = user.trim();
    // take whatever the user types and save it the db
    await channeldb.updateOne({ _id: channel },{ $push: { conversation: [{ message: message, user: trimmedUserId }] } })
    .populate("conversation.user")
      .exec((err,poppedMessage )=>{
        if(err){
          console.log(err);
        }
        // ********************************************* NEED TO BE FIXED WITH NEEDING TO RELOAD TO GET THE USER WHO SENT IT 
        // emit to user after saving
        io.emit("message",msg );
      })
    
  });

  // when user disconnects
  socket.on("disconnect", () => {
    console.log("disconnect ");
    io.emit("message", " a user disconnected........");
  });
});



// * DM SOCKETS :::::::::::::::::::::::::::::::::::
io.on("connection", (socket) => {

  Dmdb.find()
  .populate("userTo")
  .exec((err,dmMessages) => {
    if(err){
      console.log(err);
    }
    socket.emit("outputDmMsg", dmMessages);
  });
  console.log("new dm ...");
  //  socket.emit("outputDmMsg", "hello to dm ");

  // * DM SOCKET 
  socket.on("dmMessage", async (msg) => {
    // * save message to db before emitting to  the browser
    // receive an object from client, the channel name and the message that will be sent to to the database
    let { userTo, userFrom, message } = msg;
    // let trimmedUserTo = userTo.trim();
    // let trimmedUserFrom = userFrom.trim();
    // take whatever the user types and save it the db


    // both users in the dm can push in to their dm channels
    await Dmdb.updateOne({$or: [ { userTo : userTo , "conversation.userFrom": userFrom },  { userTo:userFrom , "conversation.userFrom":userTo}] },{ $push: { conversation: [{ message: message , userFrom:userFrom}] } })
    .populate("userTo")
      .exec((err,poppedDmMessage )=>{
        if(err){
          console.log(err);
        }
        // emit to user after saving
        console.log(msg);
        // console.log(poppedDmMessage);

        io.emit("dmMessage", msg);
      })

        // io.emit("dmMsg",msg);
    
  });

  // when user disconnects
  socket.on("disconnect", () => {
    console.log("disconnect ");
    io.emit("message", " a user disconnected........");
  });
});




server.listen(3001);