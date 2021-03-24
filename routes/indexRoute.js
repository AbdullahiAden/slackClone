const express = require('express')
const router = express.Router()

router.use(express.urlencoded({ extended: true }));


// REGISTER
router.get("/", async (req, res) => {
  res.render("signup");
});


    