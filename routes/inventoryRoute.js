// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const invValidate = require("../utilities/inventory-validation")

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to build detail view
router.get("/detail/:invId", utilities.handleErrors(invController.buildByInvId));

// Route to build management view
router.get("/", utilities.checkPermission, utilities.handleErrors(invController.buildManagement));

// Route to add classification view
router.get("/add-classification", utilities.checkPermission, utilities.handleErrors(invController.buildAddClassification));

// Route to add inventory view
router.get("/add-inventory", utilities.checkPermission, utilities.handleErrors(invController.buildAddInventory));

// Route to add get view
router.get("/getInventory/:classification_id", utilities.checkPermission, utilities.handleErrors(invController.getInventoryJSON))

// Route to edit by inventory_id view
router.get("/edit/:inv_id", utilities.checkPermission, utilities.handleErrors(invController.editByInventoryId));

// Route to delete confirmation view
router.get("/delete/:inv_id", utilities.checkPermission, utilities.handleErrors(invController.deleteByInventoryId));

// Route to add classification
router.post(
  '/add-classification', 
  utilities.checkPermission,
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
)

// Route to add inventory
router.post(
  '/add-inventory',
  utilities.checkPermission, 
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
)

// Route to update inventory
router.post(
  "/update/",
  utilities.checkPermission,
  invValidate.newInventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
)

router.post(
  "/delete-item",
  utilities.checkPermission,
  utilities.handleErrors(invController.deleteInventoryItem)
)

module.exports = router;