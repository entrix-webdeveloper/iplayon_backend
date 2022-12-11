const PastEvents = require("./schemas/pastEvents-schema")
const Events = require("./schemas/events-schema");
const MatchCollectionDB = require("./schemas/match-collection-schema");
const PlayerEntries = require("./schemas/player-entries-schema");
const Users = require("./schemas/users-schema");
const pdfGenerator = require("../utils/pdfGenerator")
var path = require('path');


/*
  past events data methods
  The data-method API returns the following -
    a. try/catch failure: return an object with status = false and errCode = <component-name>.<function-name>:failure
    b. else
      iß) if operation is a failure, an object with status = false and errCode = <component-name>.<function-name>:<an appropriate error string>
      ii) if operation is successful, an object with status = true and result = result of the operation
*/
let reverseDate = function (str) {
  str = str.split(" ");
  str = str[2] + " " + str[1] + " " + str[0];
  return str;
}


let getTourScoreSheet = async function (t) {
  try {
    console.log("t here " + JSON.stringify(t))
    let tourType = "";
    let eventInfo;
    let tourInfo = await Events.findOne({ "_id": t.tournamentId, tournamentEvent: true });
    if (tourInfo) tourType = "new"
    if (!tourInfo) {
      tourInfo = await PastEvents.findOne({ "_id": t.tournamentId, tournamentEvent: true })
      if (tourInfo) tourType = "past"
    }
    if (!tourInfo) return { "status": false, errCode: "tournament-not-found" }
    if (tourInfo) {
      if (tourType === "new") eventInfo = await Events.findOne({ "tournamentId": t.tournamentId, eventName: t.eventName });
      if (tourType === "past") eventInfo = await PastEvents.findOne({ "tournamentId": t.tournamentId, eventName: t.eventName });
      if (!eventInfo) return { "status": false, errCode: "tournament-category-not-found" };
      return { "status": true, tourInfo: tourInfo, eventInfo: eventInfo, tourType: tourType }

    }
  } catch (e) {
    console.log(e)
  }
}

exports.generateScoreSheet = async t => {
  let errCode = "event.get_event";

  try {
    let tourData = await getTourScoreSheet(t);
    console.log("tourData here " + JSON.stringify(tourData.status));
    if (!tourData.status) return tourData;
    let matchRecords = []

    console.log(123)
    var matchQuery = { "tournamentId": t.tournamentId, "eventName": t.eventName };
    var groupQuery = {};
    console.log(t.matchNumber)
    if (t.matchNumber != "" && t.matchNumber != undefined && t.matchNumber != null) {
      matchQuery["matchRecords.matchNumber"] = parseInt(t.matchNumber);
      groupQuery["matchRecords.matchNumber"] = parseInt(t.matchNumber);
    }
    if (t.roundNumber != "" && t.roundNumber != undefined && t.roundNumber != null) {
      matchQuery["matchRecords.roundNumber"] = parseInt(t.roundNumber);
      groupQuery["matchRecords.roundNumber"] = parseInt(t.roundNumber)
    }
    if (t.matchNumber == "" && t.roundNumber != "" && t.matchNumber != undefined && t.matchNumber != null && t.roundNumber != undefined && t.roundNumber != null) {
      groupQuery["matchRecords.status2"] = { $nin: ["bye"] };
    }
    console.log("matchQuery .. " + JSON.stringify(matchQuery))
    console.log("groupQuery .. " + JSON.stringify(groupQuery))

    if (t.matchNumber != "" || t.roundNumber != "") {
      var matchData = await MatchCollectionDB.aggregate([
        { $match: matchQuery },
        { $unwind: "$matchRecords" },
        { $match: groupQuery },
        { $group: { "_id": "$_id", "matchRecords": { $push: "$matchRecords" }, } },
        { $project: { 'matchRecords': 1 } }
      ]);
      if (matchData && matchData.length > 0 && matchData[0].matchRecords)
        matchRecords = matchData[0].matchRecords;
    }
    else {
      var matchData = await MatchCollectionDB.findOne(matchQuery);
      if (matchData && matchData.matchRecords)
        matchRecords = matchData.matchRecords;
    }

    console.log("matchRecords : " + JSON.stringify(matchRecords))
    let matchRes = await matchRecords.reduce(async function (accumulator, item) {
      const accum = await accumulator;
      if (item.roundName == "BM") {
        item.roundName = "Bronze Round"
        item.matchNumber = ""
      }
      else if (item.roundName == "PQF" || item.roundName == "QF" || item.roundName == "SF" || item.roundName == "F") {
        item.roundName = "Round : " + item.roundName
        item.matchNumber = "Match : " + item.matchNumber
      }
      else {
        item.roundName = "Round : " + item.roundNumber
        item.matchNumber = "Match : " + item.matchNumber
      }
      var players = item.playersID;
      var playerAInfo = await Users.findOne({ "userId": players.playerAId });
      var playerBInfo = await Users.findOne({ "userId": players.playerBId });
      if (playerAInfo) item.players.playerA = playerAInfo.userName;
      if (playerBInfo) item.players.playerB = playerBInfo.userName;


      await (accum.push(item));
      return accum;
    }, []);
    var data = {
      "matchRecords": matchRes,
      "eventName": tourData.eventInfo.eventName,
      "tournamentName": tourData.tourInfo.eventName,
      "eventStartDate": reverseDate(tourData.eventInfo.eventStartDate),
      "eventEndDate": reverseDate(tourData.eventInfo.eventEndDate),
      "tournamentVenue": tourData.tourInfo.venueAddress,
      "tournamentAddress": tourData.tourInfo.domainName,
    }

    let templateFile = path.join(appRoot, '/views/scoreSheet.ejs');
    console.log(templateFile + 'djfh')
    let footerTemplate = '<style>span{width:100% !important;}    .footerD { padding:10px;background-color:#f6bcba;width:100% !important;-webkit-print-color-adjust: exact}</style><div class = "footerD"> <span style="color:white;font-size:10px;text-align:left;">Report autogenerated by Oota</span></div>'

    let headerTemplate = '<style>';
    headerTemplate += '.headerH{  color: black; font-size: 26px; text-align:center; font-weight: bold;margin:10px;padding:2px}';
    headerTemplate += '.headerD {  }'
    headerTemplate += '.headerOuter { width:100% !important;padding:10px;justify-content: flex-end;-webkit-print-color-adjust: exact; }';
    headerTemplate += '</style>';
    headerTemplate += '<div style="flex-direction:column;display:flex;background:red"><div class="headerOuter">'
    headerTemplate += '</div>';
    headerTemplate += '<div><span class="headerH"></span><br/></div>'
    headerTemplate += '</div>'

    let bufferData = await pdfGenerator.generateBufferPortrait(templateFile, {
      title: '',
      helper: require('../utils/common'),
      data: data,
    },
      {
        "orientation": "portrait",
        "format": "Letter",
        "header": {
          height: "0mm"
        },
        "footer": {
          height: "0mm"
        },
        headerTemplate: '<div></div>',
        footerTemplate: '<div></div>'
      }
    );
    return { "status": true, statusCode: 200, result: bufferData.data.toString('base64') }

  } catch (e) {
    return { status: false, statusCode: 500, errCode: errCode + `:exception-failure` };
  }
};


exports.generateBlankScoreSheet = async t => {
  let errCode = "event.get_event";
  try {

    let tourData = await getTourScoreSheet(t);
    console.log("tourData here " + JSON.stringify(tourData));
    if (!tourData.status) return tourData;
    let matchRecords = [0, 1, 2]
    var data = {
      "matchRecords": matchRecords,
      "eventName": tourData.eventInfo.eventName,
      "tournamentName": tourData.tourInfo.eventName,
      "eventStartDate": reverseDate(tourData.eventInfo.eventStartDate),
      "eventEndDate": reverseDate(tourData.eventInfo.eventEndDate),
      "tournamentVenue": tourData.tourInfo.venueAddress,
      "tournamentAddress": tourData.tourInfo.domainName,
    }
    let templateFile = path.join(appRoot, '/views/scoreSheet.ejs');
    console.log(templateFile + 'djfh')
    let footerTemplate = '<style>span{width:100% !important;}    .footerD { padding:10px;background-color:#f6bcba;width:100% !important;-webkit-print-color-adjust: exact}</style><div class = "footerD"> <span style="color:white;font-size:10px;text-align:left;">Report autogenerated by Oota</span></div>'

    let headerTemplate = '<style>';
    headerTemplate += '.headerH{  color: black; font-size: 26px; text-align:center; font-weight: bold;margin:10px;padding:2px}';
    headerTemplate += '.headerD {  }'
    headerTemplate += '.headerOuter { width:100% !important;padding:10px;justify-content: flex-end;-webkit-print-color-adjust: exact; }';
    headerTemplate += '</style>';
    headerTemplate += '<div style="flex-direction:column;display:flex;background:red"><div class="headerOuter">'
    headerTemplate += '</div>';
    headerTemplate += '<div><span class="headerH"></span><br/></div>'
    headerTemplate += '</div>'

    let bufferData = await pdfGenerator.generateBufferPortrait(templateFile, {
      title: '',
      helper: require('../utils/common'),
      data: data,
    },
      {
        "orientation": "portrait",
        "format": "Letter",
        "header": {
          height: "0mm"
        },
        "footer": {
          height: "0mm"
        },
        headerTemplate: '<div></div>',
        footerTemplate: '<div></div>'
      }
    );
    return { "status": true, statusCode: 200, result: bufferData.data.toString('base64') }

  } catch (e) {
    console.log(e);
    return { status: false, statusCode: 500, errCode: errCode + `:exception-failure` };
  }
};


