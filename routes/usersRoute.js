const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');
const passport = require('passport');

require("./config/passport")(passport);

const Usersdb = require("./models/user");

const { ensureAuthenticated } = require("./config/auth");

// handle signup
router.post("/user/register", (req, res) => {
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
  
  // LOGIN
  router.get("/user/login", (req, res) => {
    res.render("login");
  });
  
  router.post("/user/login", (req, res, next) => {
    passport.authenticate("local", {
      successRedirect: "/channels",
      failureRedirect: "/user/login",
      failureFlash: true,
    })(req, res, next);
  });


  router.get("/profile/upload", ensureAuthenticated, (req, res) => {
    res.render("imageIndex");
  });
  
  router.post("/profile/upload", async (req, res) => {
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
  