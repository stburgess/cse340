const utilities = require(".")
const { body, validationResult } = require("express-validator")
const inventoryModel = require("../models/inventory-model")
const validate = {}

/***********************************
 *  Classification Data Validation Rules
 ********************************** */
validate.classificationRules = () => {
  return [
    // Classification is required and must be string
    body("classification_name")
      .trim()
      .escape()
      .isLength({ min: 1 })
      .matches(/^[A-Za-z]+$/)
      .withMessage("Please provide a valid classification name.") // on error this message is sent.
      .custom(async (classification_name) => {
          const classificationExists = await inventoryModel.checkExistingClass(classification_name)
          if (classificationExists){
            throw new Error("Classification already exists. Please enter a different name.")
          }
      }),
  ]
}

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkClassificationData = async (req, res, next) => {
  const { classification_name } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("inventory/add-classification", {
      errors,
      title: "Add Classification",
      nav,
      classification_name,
    })
    return
  }
  next()
}

/***********************************
 *  Inventory Data Validation Rules
 ********************************** */
validate.inventoryRules = () => {
  return [
    // Classification is required and must be string
    body("classification_id")
      .trim()
      .escape()
      .matches(/^[0-9]{1,}$/)
      .withMessage("Please select a Classification."), // on error this message is sent.
    body("inv_make")
      .trim()
      .escape()
      .matches(/^[A-Za-z]{3,}$/)
      .withMessage("Please provide a valid Make."), // on error this message is sent.
    body("inv_model")
      .trim()
      .escape()
      .matches(/^[A-Za-z0-9_\-]{3,}$/)
      .withMessage("Please provide a valid Model."), // on error this message is sent.
    body("inv_description")
      .trim()
      .escape()
      .isLength({ min: 3 })
      .withMessage("Please provide a valid Description."), // on error this message is sent.
    body("inv_image")
      .trim()
      .matches(/^\/images\/vehicles\/[a-zA-Z0-9_\-]{3,}\.[a-zA-Z]{3,4}$/)
      .withMessage("Please provide a valid Image Path."), // on error this message is sent.
    body("inv_thumbnail")
      .trim()
      .matches(/^\/images\/vehicles\/[a-zA-Z0-9_\-]{3,}\.[a-zA-Z]{3,4}$/)
      .withMessage("Please provide a valid Thumbnail Image Path."), // on error this message is sent.
    body("inv_price")
      .trim()
      .escape()
      .matches(/(^[0-9]{1,}\.[0-9]{2}$)|(^[0-9]{1,}$)/)
      .withMessage("Please provide a valid Price."), // on error this message is sent.
    body("inv_year")
      .trim()
      .escape()
      .matches(/^[0-9]{4}$/)
      .withMessage("Please provide a valid Year."), // on error this message is sent.  
    body("inv_miles")
      .trim()
      .escape()
      .matches(/^[0-9]{1,}$/)
      .withMessage("Please provide the Miles."), // on error this message is sent.
    body("inv_color")
      .trim()
      .escape()
      .matches(/^[A-Za-z]{3,}$/)
      .withMessage("Please provide a valid Color."), // on error this message is sent. 
  ]
}

/* ******************************
 * Check inventory data and return errors or return to admin
 * ***************************** */
validate.checkInventoryData = async (req, res, next) => {
  const {classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color} = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    let classificationList = await utilities.buildClassificationList(classification_id)
    res.render("inventory/add-inventory", {
      errors,
      title: "Add Inventory",
      nav,
      classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color,
      classificationList,
    })
    return
  }
  next()
}

module.exports = validate