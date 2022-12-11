/* event details */

/*
    The events endpoint supports the following operations -
        . createEvent
        - getEvent
      

    The event service supports the following APIs.
    The API params are present in the incoming req body.
    The op argument is a mnemonic which is self-explanatory WRT the operation
    The status and errCode are considered together when the operation fails
    The status and the result are considered together when the operation succeeds

   
    {op: 'getEvent', tournamentId: 'tournamentId'}
        Returns {status: true, result: <tournament>,statusCode: 201} if a tournament is successfully fetched
        Returns {status: false, errCode: 'event.get_event:invalid-tournamentId',statusCode: 400} if invalid tournamentId provided
        Returns {status: false, errCode: 'event.get_event:exception-failure',statusCode: 500} if event fetch fails due to exception errors
   
*/

const { getEvent } = require("../data-manager/events-data-method");
const authController = require("../Auth/Controllers/authController");

var validator = require("validate.js");
/** regex constants  */
let regExConstants = {
  latitude: /^(\+|-)?(?:90(?:(?:\.0{1,6})?)|(?:[0-9]|[1-8][0-9])(?:(?:\.[0-9]{1,6})?))$/,
  longitude: /^(\+|-)?(?:180(?:(?:\.0{1,6})?)|(?:[0-9]|[1-9][0-9]|1[0-7][0-9])(?:(?:\.[0-9]{1,6})?))$/
};



/** entity action based err message  */
let opCodesErr = {
  getEvent: "event:get_event",
  getEventCatgories:"event:get_event_categories"
};


let getEventValidator = {
  tournamentId: { presence: false, type: "string" }
};

let getEventCategoriesValidator = {
  tournamentId: { presence: { allowEmpty: false }, type: "string" },
}



const check = async a => {
  // all generic control knobs initialized with default values
  // the generic argument needs 4 members - proceed, an argument which is the name of the function
  // (in this function, it is check), the status code and the errCode
  // do not allow any unknown opcode to pass through
  a.proceed = true;
  a.check = true;
  a.errCode = "";
  a.status = true;
  a.statusCode = 200;
  let { op } = a.$$;
  console.log("op" +op)

  /* check if valid opcode provided else return error*/
  if (!["getEvent","getEventCategories"].includes(a.$$.op)) {
    a.status = a.proceed = a.check = false;
    a.errCode = "event:invalid-opcode";
    a.statusCode = 400;
    return a;
  }


  /** in case of getEvent - check performed based on rules defined (event validator rules)*/
  if (op === "getEvent" || op === "getEventCategories") {
    if (op === "getEvent") entityValidator = getEventValidator;
    if (op === "getEventCategories") entityValidator = getEventCategoriesValidator
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
  let { op } = a.$$
  if (op === "getEvent") {
    let query = { }
    if(op === "getEvent") query = a.$$;
    let c = await getEvent(query);
    a.result = c.status ? c.result : [];
    a.statusCode = c.statusCode;
    a.status = a.validate = a.proceed = c.status;
    a.errCode = !c.status ? `event.process:${a.$$.op}-fail;non-existent-event` : "";
  }
  if (op === "getEventCategories") {
    let query = Object.assign({tournamentEvent:false},a.$$);
    delete query.op
    let c = await getEvent(query);
    a.result = c.status ? c.result : [];
    a.statusCode = c.statusCode;
    a.status = a.validate = a.proceed = c.status;
    a.errCode = !c.status ? `event.process:${a.$$.op}-fail;non-existent-event` : "";
  }

  return a;
};

const transact = async a => {
  // if the previous method has failed, just quit
  if (!a.proceed) return a;
  let { op } = a.$$;
  if (op === 'getEvent' || op === "getEventCategories") return a;

  let c = {};
  // for each operation, call respective data-method with the appropriate data

  a.status = a.proceed = c.status;
  a.errCode = !c.status ? c.errCode : "";
  a.statusCode = c.statusCode;
  a.transact = c.status;
  a.result = c.result;
  return a;
};

let _events = {};
_events.process = async cmd => {
  return await transact(await validate(await check(cmd)));
};
const events_service = async (req, res) => {
  console.log(111)
  let events = Object.create(_events);
  let tmp = {};
  tmp.$$ = {};
  // get the req.body
  Object.assign(tmp.$$, req.body);
  // extract the op - just to get a shortcut
  tmp.op = req.body.op;
  // formulate a default error code
  let defaultErrCode = `events:${req.body.op}-process-failure`;
  // create a result object by calling the sms_admin.process method
  // the process sub-methods (check, validate & transact) invoke the data-methods.
  try {
    let y = await events.process(tmp);
    // if success, send status = 200 along with result
    if (y.proceed) res.status(y.statusCode).json(y.result);
    // if not, send status = 400 along with error code
    else
      res.status(y.statusCode).json({
        status: false,
        errCode: y.errCode
      });
  } catch (e) {
    console.log(e);
    // if the process fails, send false status and default sms_admin error code
    res.status(424).send({ status: false, errCode: defaultErrCode });
  }
};

module.exports = { events_service, _events };
