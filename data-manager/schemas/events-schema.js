const mongoose = require('mongoose');


const eventsSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: function () { return new mongoose.Types.ObjectId(); }
    },
    eventName: { type: String },
    projectId: { type: [String] },
    projectName: { type: String },
    abbName: { type: String },
    eventStartDate: { type: String },
    eventEndDate: { type: String },
    eventSubscriptionLastDate: { type: Date },
    eventStartDate1: { type: Date },
    eventEndDate1: { type: Date },
    eventSubscriptionLastDate1: { type: Date, optional: true },
    offset: { type: Number },
    offsetOfDomain: { type: Number },
    timeZoneName: { type: String },
    domainId: { type: [String], optional: true },
    domainName: { type: String, },
    subDomain1Name: { type: [String] },
    subDomain2Name: { type: [String] },
    venueLatitude: { type: String },
    venueLongitude: { type: String },
    prize: { type: String },
    prizePdfId: { type: String },
    rulesAndRegulations: { type: String },
    eventOrganizer: { type: String },
    resultsOfTheEvents: { type: String },
    description: { type: String },
    eventApprovalStatusByAdmin: { type: Boolean, },
    eventStatus: { type: String },
    sponsorLogo: { type: String, },
    sponsorPdf: { type: String, },
    sponsorUrl: { type: String, },
    sponsorMailId: { type: String },
    eventParticipants: { type: [String] },
    eventCreatedDate: { type: Date, optional: true },
    eventUpdatedDate: { type: Date, optional: true },
    venueAddress: { type: String, optional: true },
    timezoneIdEventLat: { type: String, optional: true },
    timezoneIdEventLng: { type: String, optional: true },
    tournamentEvent: { type: Boolean, optional: true },
    tournamentId: { type: String, optional: true },
    eventsUnderTournament: { type: [String], optional: true },
    eventsProjectIdUnderTourn: { type: [String], optional: true },
    projectType: { type: Number, optional: true },
    eventSubId: { type: String, optional: true },
    subscriptionTypeDirect: { type: String, optional: true },
    subscriptionTypeHyper: { type: String, optional: true },
    hyperLinkValue: { type: String, optional: true },
    subscriptionTypeMail: { type: String, optional: true },
    subscriptionTypeMailValue: { type: String, optional: true },
    source: { type: String, default: "" },
    tournamentType: { type: String, optional: true },
    stateAssocId: { type: String, default: "" },
    subscriptionWithAffId : {type: String},
    allowSubscription: { type: String, default: "yes" },
    paymentEntry: { type: String, default: "no" },
}, {
    timestamps: true
});

eventsSchema.pre('save', function (next) {
    now = new Date();
    this.eventUpdatedDate = now;
    if (!this.eventCreatedDate) {
        this.eventCreatedDate = now;
    }
    next();
});

const Events = mongoose.model('events', eventsSchema);
module.exports = Events;

