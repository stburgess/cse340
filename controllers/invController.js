const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
    errors: null,
  })
}

/* ***************************
 *  Build detail view
 * ************************** */
invCont.buildByInvId = async function (req, res, next) {
  const inv_id = req.params.invId
  const data = await invModel.getInventoryByInvId(inv_id)
  const grid = await utilities.buildDetailGrid(data)
  let nav = await utilities.getNav()
  const invYear = data[0].inv_year
  const invMake = data[0].inv_make
  const invMod = data[0].inv_model
  res.render("./inventory/detail", {
    title: invYear + " " + invMake + " " + invMod,
    nav,
    grid,
    errors: null,
  })
}

/* ****************************************
*  Deliver management view
* *************************************** */
invCont.buildManagement = async function buildManagement(req, res, next) {
  let nav = await utilities.getNav()
  let classificationList = await utilities.buildClassificationList()
  res.render("./inventory/management", {
    title: "Vehicle Management",
    nav,
    errors: null,
    classificationList,
  })
}

/* ****************************************
*  Deliver add classification view
* *************************************** */
invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Process Add Classification
* *************************************** */
invCont.addClassification = async function (req, res) {
  const { classification_name } = req.body
  const addResult = await invModel.addClassification(classification_name)
  let nav = await utilities.getNav()
  if (addResult) {
    req.flash(
      "notice",
      `${classification_name} was successfully added to Classification.`
    )
    res.status(201).render("./inventory/management", {
      title: "Vehicle Management",
      nav,
      errors: null,
    })  
  } else {
    req.flash("notice", `Sorry, ${classification_name} could not be added.`)
    res.status(501).render("./inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors,
    })
  }
}

/* ****************************************
*  Deliver add inventory view
* *************************************** */
invCont.buildAddInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  let classificationList = await utilities.buildClassificationList()
  res.render("./inventory/add-inventory", {
    title: "Add Vehicle",
    nav,
    classificationList,
    errors: null,
  })
}

/* ****************************************
*  Process Add Inventory
* *************************************** */
invCont.addInventory = async function (req, res) {
  const { classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color  } = req.body
  const addResult = await invModel.addInventory(inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id)
  let nav = await utilities.getNav()
  let classificationList = await utilities.buildClassificationList(classification_id)
  if (addResult) {
    req.flash(
      "notice",
      `${inv_make} ${inv_model} was successfully added to Inventory.`
    )
    res.redirect("/inv")
    //res.status(201).render("./inventory/management", {
    //  title: "Vehicle Management",
    //  nav,
    //  errors: null,
  } else {
    req.flash("notice", `Sorry, ${inv_make} ${inv_model} could not be added.`)
    res.status(501).render("./inventory/add-inventory", {
      title: "Add Vehicle",
      nav,
      classificationList,
      errors,
    })
  }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editByInventoryId = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryByInvId(inv_id)
  const classificationList = await utilities.buildClassificationList(itemData[0].classification_id)
  const itemName = `${itemData[0].inv_make} ${itemData[0].inv_model}`
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationList,
    errors: null,
    inv_id: itemData[0].inv_id,
    inv_make: itemData[0].inv_make,
    inv_model: itemData[0].inv_model,
    inv_year: itemData[0].inv_year,
    inv_description: itemData[0].inv_description,
    inv_image: itemData[0].inv_image,
    inv_thumbnail: itemData[0].inv_thumbnail,
    inv_price: itemData[0].inv_price,
    inv_miles: itemData[0].inv_miles,
    inv_color: itemData[0].inv_color,
    classification_id: itemData[0].classification_id,
  })
}

/* ****************************************
*  Process update Inventory
* *************************************** */
invCont.updateInventory = async function (req, res) {
  const { classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, inv_id } = req.body
  const upDateResult = await invModel.updateInventory(inv_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id)
  let nav = await utilities.getNav()
  let classificationList = await utilities.buildClassificationList(classification_id)
  if (upDateResult) {
    req.flash("notice", `${inv_make} ${inv_model} was successfully updated.`)
    res.redirect("/inv")
  } else {
    req.flash("notice", `Sorry, ${inv_make} ${inv_model} could not be updated.`)
    res.status(501).render("./inventory/edit-inventory", {
      title: "Edit " + `${inv_make} ${inv_model}`,
      nav,
      classificationList,
      inv_id, classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color,
      errors,
    })
  }
}

/* ***************************
 *  Build delete inventory confirm view
 * ************************** */
invCont.deleteByInventoryId = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryByInvId(inv_id)
  const itemName = `${itemData[0].inv_make} ${itemData[0].inv_model}`
  res.render("./inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    errors: null,
    inv_id: itemData[0].inv_id,
    inv_make: itemData[0].inv_make,
    inv_model: itemData[0].inv_model,
    inv_year: itemData[0].inv_year,
    inv_price: itemData[0].inv_price,
  })
}

/* ****************************************
*  Process delete Inventory
* *************************************** */
invCont.deleteInventoryItem = async function (req, res) {
  const {inv_id, inv_make, inv_model, inv_year, inv_price} = req.body
  const upDateResult = await invModel.deleteInventoryItem(inv_id)
  let nav = await utilities.getNav()
  if (upDateResult) {
    req.flash("notice", `${inv_make} ${inv_model} was successfully deleted.`)
    res.redirect("/inv")
  } else {
    req.flash("notice", `Sorry, ${inv_make} ${inv_model} could not be deleted.`)
    res.status(501).render("./inventory/delete-confirm", {
      title: "Delete " + `${inv_make} ${inv_model}`,
      nav,
      inv_id, inv_make, inv_model, inv_year, inv_price,
      errors,
    })
  }
}

module.exports = invCont