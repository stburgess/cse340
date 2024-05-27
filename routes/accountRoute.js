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

// Route to build account management view
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManage))

// Route to register account
router.post(
  '/register', 
  regValidate.regRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Process the login request
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLogData,
  utilities.handleErrors(accountController.accountLogin)
)

module.exports = router;