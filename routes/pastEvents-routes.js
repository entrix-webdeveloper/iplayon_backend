const express = require("express");
// const authController = require("../Auth/Controllers/authController");
const { past_events_service } = require("../components/pastEvents");
const pastEventsRouter = express.Router();

let rolesAcc = {
    createBuyer: ["user"],
    updateBuyer: ["user", "admin"]
};
pastEventsRouter.post("/pastEvents",
    //authController.protect,
    //(req, res, next) => authController.restrictRole(req, res, next, rolesAcc, ["createBuyer"]),
    past_events_service);
module.exports = pastEventsRouter;
