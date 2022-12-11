const express = require("express");
// const authController = require("../Auth/Controllers/authController");
const { events_service } = require("../components/events");
const eventsRouter = express.Router();

let rolesAcc = {
  createBuyer: ["user"],
  updateBuyer: ["user", "admin"]
};
eventsRouter.post("/events",
  //authController.protect,
  //(req, res, next) => authController.restrictRole(req, res, next, rolesAcc, ["createBuyer"]),
  events_service);
module.exports = eventsRouter;
