/*
  Copyright Whizdata (https://whizdata.in)
**/

const Events = require("./schemas/events-schema");




/**
 * This file consists data methods of Events 
 */

/**
 * create a event
 * it creates a event object and saves to events collection
 * on success saved object is sent as result with status code 201
 * on failure 500 is sent
 */
exports.createEvent = async (t) => {
    try {
        
    }
    catch (e) {
        
    }
}


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
        if (t.tournamentId) query._id = t.tournamentId
       
            
        let tourEvent = await Events.find(query)
       
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

