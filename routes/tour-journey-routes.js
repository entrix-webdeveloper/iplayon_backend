const express = require("express");
const { tour_journey_service } = require("../journeys/tourStationary")
const tourJournRouter = express.Router();


tourJournRouter.post("/tourJourney", tour_journey_service);
module.exports = tourJournRouter;
