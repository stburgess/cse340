// Needed Resources 
const express = require("express")
const router = new express.Router() 
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")
const regValidate = require('../utilities/account-validation')

// Route to build account login form view
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Route to build account register form view
router.get("/register", utilities.handleErrors(accountController.buildRegister));

// Route to register account
router.post(
  '/register', 
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkRegData2,
  (req, res) => {
    res.status(200).send('login process')
  }
)

module.exports = router;