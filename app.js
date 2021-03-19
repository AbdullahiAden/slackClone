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

const channeldb = require("./models/channel");
const Usersdb = require("./models/user");
const Dmdb = require("./models/dm");

const fileUpload = require("express-fileupload");

require("./config/passport")(passport);

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

// ------ ROUTES ----------

// * REGISTER
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

// * LOGIN
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

//* :::::::::::::::::::::::: POPULATE   :::::::::::::::::::::::::::::::::::::::::::::::
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
app.post("/channels/new", (req, res) => {
  const channelName = req.body.channelInput;
  const newChannel = channeldb({ channelName });

  console.log(newChannel);
  // if there is channel written
  if (channelName) {
    newChannel.save();
  }
  res.redirect("/channels");
});

app.get("/channels/:id", async (req, res) => {
  const { id } = req.params;


   await channeldb.find({ _id: id })
  .populate("user")
  .exec((err, poppedChannel)=>{
    if(err){
      console.log(err);
    }
    console.log(poppedChannel);
    res.render("home", { data: poppedChannel, user: req.user });
    
  });
   
  
  // console.log(currentChannel);

});


app.get("/dm/:id",async (req,res)=>{
  const {id} = req.params

  Dmdb.findOne({_id: id}).then((err, dmUsers)=>{
    if(err){
      console.log(err)
    }
    console.log(dmUsers);
    res.render("home", {dmUsers})
  })

  
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

// * upload profile pic

app.get("/profile/upload", (req, res) => {
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

// *

// *............................................. SOCKETS  .........................................................................
// *................................................................................................................................

io.on("connection", (socket) => {
  // console.log("user connected");
  // find all RIGHT message from db and send to frontend, there will checked
  channeldb.find().then((messages) => {
    socket.emit("outputmsg", messages);
  });

  // send your message to everyone except you -- listen for chatMessage that is sent from client
  socket.on("chatMessage", async (msg) => {
    // * save message to db before emitting to  the browser
    // receive an object from client, the channel name and the message that will be sent to to the database
    let { channel, message, user } = msg;

    console.log(channel);
    console.log(message);
    console.log(user);

    // trim to remove space from the string
    let trimmedUser = user.trim();

    // * take whatever the user types and save it the db
    let chatMessage = await channeldb.updateOne(
      { _id: channel },
      { $push: { conversation: [{ message: message, user: trimmedUser }] } }
    );

    // * populate user in channels
    // const theChannel = await channeldb.findById({_id : channel}).then(c=> console.log(c))
    //   const theUser =  await Usersdb.findById({_id : user}).then(res=>{
    //     console.log(res);
    // }).catch(e=>{
    //     console.log(e);
    // })
    // theChannel.user.push(theUser)
    // .populate("user").then(console.log(channeldb))

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
