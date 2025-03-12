const express = require("express");
const { approveUser } = require("../controllers/admin-Controller");
const router = express.Router();

router.put("/approve/:userId", approveUser);

module.exports = router;
