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

// Route to account edit view
router.get("/edit/:account_id", utilities.checkPermission2, utilities.handleErrors(accountController.buildAccountEdit))

// Route to delete account view
router.get("/delete/:account_id", utilities.checkPermission2, utilities.handleErrors(accountController.buildAccountDelete))

// Process the logout request
router.get("/logout", utilities.handleErrors(accountController.accountLogout))

// Route to register account
router.post(
  '/register', 
  regValidate.regRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Route to process login request
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLogData,
  utilities.handleErrors(accountController.accountLogin)
)

// Route to process account update request
router.post(
  "/update",
  utilities.checkPermission2P,
  regValidate.updateRules(),
  regValidate.checkAccountUpdate,
  utilities.handleErrors(accountController.updateAccount)
)

// Route to process password update request
router.post(
  "/change",
  utilities.checkPermission2P,
  regValidate.passwordRules(),
  regValidate.checkPasswordChange,
  utilities.handleErrors(accountController.changePassword)
)

// Route to process accout delete request
router.post(
  "/delete",
  utilities.checkPermission2P,
  regValidate.deleteAccountRules(),
  regValidate.checkDeleteAccount,
  utilities.handleErrors(accountController.deleteAccount)
)

module.exports = router;