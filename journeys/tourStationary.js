
/**
 * org journey opcodes
 * "addOrgLoc" - validate org and create loc and add loc under org
 */

/**
 *  {op: 'getBlankScoreSheet', tournamentId:'',eventName:''}
       Returns {status: true, result: <loc>,statusCode: 201} if a location is successfully fetched
       Returns {status: false, errCode: 'tour_journey.blank_score_sheet:invalid-tournamentId',statusCode: 400} if invalid/empty tournamentId provided
        Returns {status: false, errCode: 'tour_journey.blank_score_sheet:invalid-eventName',statusCode: 400} if invalid/empty eventName provided
       Returns {status: false, errCode: 'tour_journey.blank_score_sheet:exception-failure',statusCode: 500} if service call fails due to exception errors

       Mandatory - tournamentId, eventName

    {op: 'getScoreSheet', tournamentId:'',eventName:'', matchNumber:'', roundNumber:''}
       Returns {status: true, result: <loc>,statusCode: 201} if a location is successfully fetched
       Returns {status: false, errCode: 'tour_journey.score_sheet:invalid-tournamentId',statusCode: 400} if invalid/empty tournamentId provided
        Returns {status: false, errCode: 'tour_journey.score_sheet:invalid-eventName',statusCode: 400} if invalid/empty eventName provided
       Returns {status: false, errCode: 'tour_journey.score_sheet:exception-failure',statusCode: 500} if service call fails due to exception errors

       Mandatory - tournamentId, eventName
       Optional - matchNumber, roundNumber
    */

const { _events } = require("../components/events")
const { _pastevents } = require("../components/pastEvents")
const { generateBlankScoreSheet, generateScoreSheet } = require("../data-manager/tour-journey-data-methods")
var validator = require("validate.js");

/** regex constants  */
let regExConstants = {

};

/** entity action based err message  */
let journeyCode = "tour_journey";
let opCodesErr = {
  getBlankScoreSheet: journeyCode + ":blank_score_sheet",
  getScoreSheet: journeyCode + ":score_sheet"

};

let scoreSheetValidator = {
  tournamentId: { presence: { allowEmpty: false }, type: "string" },
  eventName: { presence: { allowEmpty: false }, type: "string" },
  matchNumber: { presence: false, type: "number" },
  roundNumber: { presence: false, type: "number" },
};

const check = async a => {
  // all generic control knobs initialized with default values
  // the generic argument needs 4 members - proceed, an argument which is the name of the function
  // (in this function, it is check), the status code and the errCode
  // do not allow any unknown opcode to pass through
  a.proceed = a.check = a.status = true;
  a.errCode = "";
  a.statusCode = 200;
  let { op } = a.$$;

  if (!["getBlankScoreSheet","getScoreSheet"].includes(op)) {
    a.errCode = journeyCode + ":invalid-opcode";
    a.statusCode = 400;
    a.proceed = a.check = a.status = false;
    return a;
  }

  /** in case of getEvent - check performed based on rules defined (event validator rules)*/
  if (op === "getBlankScoreSheet" || op === "getScoreSheet") {
    if (op === "getBlankScoreSheet" || op === "getScoreSheet") entityValidator = scoreSheetValidator;
    let isValid = validator(a.$$, entityValidator);
    a.status = a.proceed = a.check = isValid ? false : true;
    if (isValid) {
      a.errCode = opCodesErr[a.$$.op] + ":" + "invalid-" + Object.keys(isValid)[0];
      a.statusCode = 400;
      return a;
    }
  }

  return a;
};

const validate = async a => {
  // if the previous method has failed, just quit
  if (!a.proceed) return a;
  let { op } = a.$$;
  let c; 

  if (op === "getBlankScoreSheet") {
    c = await generateBlankScoreSheet(a.$$);
    a.status = a.proceed = c.status;
    a.errCode = !c.status ? c.errCode : "";
    a.statusCode = c.statusCode;
    a.transact = c.status;
    a.result = c.result;
    if (!a.proceed) return a;
  }
  if (op === "getScoreSheet") {
    c = await generateScoreSheet(a.$$);
    a.status = a.proceed = c.status;
    a.errCode = !c.status ? c.errCode : "";
    a.statusCode = c.statusCode;
    a.transact = c.status;
    a.result = c.result;
    if (!a.proceed) return a;
  }

  return a;
};

const transact = async (a, req, res, next) => {
  // if the previous method has failed, just quit
  if (!a.proceed) return a;
  let { op } = a.$$;

  // data-methods start here:
  if (op === "getBlankScoreSheet") return a;
  if (!a.proceed) return a;
  return a;
};

let _tour_journey = {};
_tour_journey.process = async (cmd, req, res, next) => {
  return await transact(await validate(await check(cmd)), req, res);
};

const tour_journey_service = async (req, res, next) => {
  let tourJourney = Object.create(_tour_journey);
  let tmp = {};
  tmp.$$ = {};
  // get the req.body
  Object.assign(tmp.$$, req.body);
  // extract the op - just to get a shortcut
  tmp.op = req.body.op;
  // formulate a default error code
  let defaultErrCode = `tourJourney:${req.body.op}-process-failure`;
  // create a result object by calling the tour journey.process method
  // the process sub-methods (check, validate & transact) invoke the data-methods.
  try {
    let y = await tourJourney.process(tmp, req, res, next);
    //if success, send status = 200 along with result
    if (y.proceed && y.sendStatus) res.status(y.statusCode).json({ status: true, result: y.result })
    else if (y.proceed) res.status(y.statusCode).json(y.result);
    // if not, send status = 400 along with error code
    else
      res.status(y.statusCode).json({
        status: false,
        errCode: y.errCode,
        result: y.result
      });
  } catch (e) {
    console.log(e);
    // if the process fails, send false status and default sms error code
    res.status(424).send({ status: false, errCode: defaultErrCode });
  }
};

module.exports = { tour_journey_service, _tour_journey };

