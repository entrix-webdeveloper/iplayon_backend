const PastEvents = require("./schemas/pastEvents-schema")

/*
  past events data methods
  The data-method API returns the following -
    a. try/catch failure: return an object with status = false and errCode = <component-name>.<function-name>:failure
    b. else
      iß) if operation is a failure, an object with status = false and errCode = <component-name>.<function-name>:<an appropriate error string>
      ii) if operation is successful, an object with status = true and result = result of the operation
*/


exports.createPastEvents = async b => {
 
};

/*
    The getEvent method finds the event object based on the id
    If the operation is successful,  event object is returned with status true
    If event object not found,404 error code is returned along with a false status
    If exception,500 error code is returned along with a false status and with exception errCode
*/
exports.getEvent = async t => {
  let errCode = "event.get_event";
  try {
    let query = {}
    if (t.id) query._id = t.id
    if (t.tournamentId) {
      query._id = t.tournamentId
      query.tournamentEvent = true;
    }
    let tourEvent = await PastEvents.find(query)
    if (tourEvent && tourEvent.length) {
      return { status: true, statusCode: 200, result: tourEvent };
    } else {
      return { status: false, statusCode: 404, errCode: errCode + ":event-not-found" };
    }
  } catch (e) {
    console.log(e);
    return { status: false, statusCode: 500, errCode: errCode + `:exception-failure` };
  }
};


