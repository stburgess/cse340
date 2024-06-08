const utilities = require(".")
const { body, validationResult } = require("express-validator")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const validate = {}

/***********************************
 *  Registration Data Validation Rules
 ********************************** */
 validate.regRules = () => {
  return [
    // firstname is required and must be string
    body("account_firstname")
      .trim()
      .escape()
      .matches(/^[a-zA-Z]{1,}$/)
      .withMessage("Please provide a first name."), // on error this message is sent.
  
      // lastname is required and must be string
    body("account_lastname")
      .trim()
      .escape()
      .matches(/^[a-zA-Z]{1,}$/)
      .withMessage("Please provide a last name."), // on error this message is sent.
  
    // valid email is required and cannot already exist in the DB
    body("account_email")
      .trim()
      .escape()
      .isEmail()
      .normalizeEmail() // refer to validator.js docs
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email)
        if (emailExists){
          throw new Error("Email already exists. Login, or register with a different email")
        }
      }),
  
    // password is required and must be strong password
    body("account_password")
      .trim()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ]
}

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      errors,
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    })
    return
  }
  next()
}

/*  **********************************
  *  Login Data Validation Rules
  * ********************************* */
  validate.loginRules = () => {
    return [
      // valid email is required and cannot already exist in the DB
      body("account_email")
        .trim()
        .escape()
        .isEmail()
        .normalizeEmail() // refer to validator.js docs
        .withMessage("A valid email is required.")
        .custom(async (account_email) => {
          const emailExists = await accountModel.checkExistingEmail(account_email)
          if (!emailExists){
            throw new Error("Email not found. Please try a different email or sign-up.")
          }
        }),
  
      // password is required and must be strong password
      body("account_password")
        .trim()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
    ]
  }

/* ******************************
 * Check data and return errors and return to login
 * ***************************** */
validate.checkLogData = async (req, res, next) => {
  const { account_email } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/login", {
      errors,
      title: "Login",
      nav,
      account_email,
    })
    return
  }
  next()
}

/***********************************
 *  Update Account Data Validation Rules
 ********************************** */
 validate.updateRules = () => {
  return [
    // firstname is required and must be string
    body("account_firstname")
      .trim()
      .escape()
      .matches(/^[a-zA-Z]{1,}$/)
      .withMessage("Please provide a first name."), // on error this message is sent.
  
      // lastname is required and must be string
    body("account_lastname")
      .trim()
      .escape()
      .matches(/^[a-zA-Z]{1,}$/)
      .withMessage("Please provide a last name."), // on error this message is sent.
  
    // valid email is required and cannot already exist in the DB
    body("account_email")
      .trim()
      .escape()
      .isEmail()
      .normalizeEmail() // refer to validator.js docs
      .withMessage("A valid email is required.")
      .custom(async (account_email, {req}) => {
        console.log(account_email, req.body.account_id)
        const emailExists = await accountModel.checkExistingEmail2(account_email, parseInt(req.body.account_id))
        console.log(emailExists)
        if (emailExists){
          throw new Error("Email already exists. Please choose a different email.")
        }
      }), 
  ]
}

/* ******************************
 * Check account data and return errors or continue to account management
 * ***************************** */
validate.checkAccountUpdate = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/account-edit", {
      errors,
      title: "Edit Account Info or Password",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    })
    return
  }
  next()
}

/*  **********************************
  *  Login Data Validation Rules
  * ********************************* */
  validate.passwordRules = () => {
    return [
      // password is required and must be strong password
      body("account_password")
        .trim()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
    ]
  }

  /* ******************************
 * Check account data and return errors or continue to account management
 * ***************************** */
validate.checkPasswordChange = async (req, res, next) => {
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/account-edit", {
      errors,
      title: "Edit Account Info or Password",
      nav,
    })
    return
  }
  next()
}


/*  **********************************
*  Delete account data Validation Rules
* ********************************* */
validate.deleteAccountRules = () => {
  return [
    // password is required and must be strong password
    body("account_password")
      .trim()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Please enter valid password.")
      .custom(async (account_password, {req}) => {
        const returnData = await accountModel.getAccountByEmail(req.body.account_email)
        const pwSame = await bcrypt.compare(account_password, returnData.account_password)
        if (!pwSame){
          throw new Error("Password does not match your account. Delete request rejected!")
        }
      }),
  ]
}

/* ******************************
 * Check for correct passord and then next to delete
 * ***************************** */
validate.checkDeleteAccount = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/account-delete", {
      errors,
      title: "Delete Account",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    })
    return
  }
  next()
}

module.exports = validate