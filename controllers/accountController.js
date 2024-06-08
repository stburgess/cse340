const accountModel = require("../models/account-model")
const utilities = require("../utilities/")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("./account/login", {
    title: "Login",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Deliver register view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("./account/register", {
    title: "Register",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

// Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations ${account_firstname}, you\'re registered. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res, next) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
    if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    } else {
      req.flash("notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    return new Error('Access Forbidden')
  }
}

/* ****************************************
 *  Process logout request
 * ************************************ */
async function accountLogout(req, res) {
  try {
    res.clearCookie("jwt")
    return res.redirect("/")
  } catch (error) {
    return new Error('Error while trying to logout')
  }
}

/* ****************************************
*  Deliver account management view
* *************************************** */
async function buildAccountManage(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/account-management", {
    title: "Account Management",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Build account edit view
* *************************************** */
async function buildAccountEdit(req, res, next) {
  const account_id = req.params.account_id
  let nav = await utilities.getNav()
  const returnData = await accountModel.getAccountById(account_id)
  res.render("account/account-edit", {
    title: "Edit Account Info or Password",
    nav,
    errors: null,
    account_firstname: returnData.account_firstname,
    account_lastname: returnData.account_lastname,
    account_email: returnData.account_email,
    account_id: returnData.account_id,
  })
}

/* ****************************************
 *  Process update account info request
 * ************************************ */
 async function updateAccount (req, res) {
  const {account_firstname, account_lastname, account_email, account_id} = req.body
  const upDateResult = await accountModel.updateAccount(account_firstname, account_lastname, account_email, parseInt(account_id))
  let nav = await utilities.getNav()
  if (upDateResult) {
    req.flash("notice", `${account_firstname}, your account details were successfully updated.`)
    res.redirect("/account")
  } else {
    req.flash("notice", `Sorry, your account information could not be updated.`)
    res.status(501).render("account/account-edit", {
      title: "Edit Account Info or Password",
      nav,
      account_firstname, account_lastname, account_email, account_id,
      errors: null,
    })
  }
}

/* ****************************************
*  Process password update
* *************************************** */
async function changePassword(req, res) {
  let nav = await utilities.getNav()
  const { account_password, account_id } = req.body

// Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'There was an error processing the password update.')
    res.status(500).render("account/account-edit", {
      title: "Edit Account Info or Password",
      nav,
      errors: null,
    })
  }

  const changeResult = await accountModel.changePassword( hashedPassword, parseInt(account_id))

  if (changeResult) {
    req.flash(
      "notice",
      "Your password has been updated."
    )
    res.redirect("/account")
  } else {
    req.flash("notice", "Sorry, the password update failed.")
    res.status(501).render("account/account-edit", {
      title: "Edit Account Info or Password",
      nav,
      errors: null,
    })
  }
}

/* ***************************
 *  Build delete account confirm view
 * ************************** */
async function buildAccountDelete(req, res, next) {
  let nav = await utilities.getNav()
  const account_id = req.params.account_id
  const returnData = await accountModel.getAccountById(parseInt(account_id))
  res.render("account/account-delete", {
    title: "Delete Account",
    nav,
    errors: null,
    account_firstname: returnData.account_firstname,
    account_lastname: returnData.account_lastname,
    account_email: returnData.account_email,
    account_id: returnData.account_id,
  })
  return
}

/* ****************************************
 *  Process delete account request
 * ************************************ */
async function deleteAccount(req, res, next) {
  let nav = await utilities.getNav()
  const { account_id, account_firstname, account_lastname, account_email, account_password } = req.body
  try {
    if (await accountModel.deleteAccountById(account_id)) {
      res.clearCookie("jwt")
      delete res.accountData
      req.flash("notice", "Your account has been deleted!")
      res.redirect("/")
    } else {
      req.flash("notice", "Problem encountered while trying to delete account.")
      res.status(500).render("account/account-delete", {
        title: "Delete Account",
        nav,
        account_id,
        account_firstname,
        account_lastname,
        account_email,
        errors: null,
      })
    } 
    return 
  } catch (error) {
    return new Error('Error while trying to delete account')
  }
}

module.exports = {buildLogin, buildRegister, registerAccount, accountLogin, buildAccountManage, accountLogout, buildAccountEdit, updateAccount, changePassword, buildAccountDelete, deleteAccount}