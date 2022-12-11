const { Promise } = require("mongoose");
const sgMail = require('@sendgrid/mail');

const common = {};

common.capitalize = (str) => {
  if (str === null || str === "" || str === undefined) return str;
  return str.charAt(0).toUpperCase() + str.slice(1)
}
common.capitalizeWord = (str) => {
  if (str === null || str === "" || str === undefined) return str;
  return str.split(' ').map(w => w.substring(0, 1).toUpperCase() + w.substring(1)).join(' ')
}
common.sendEmail = (data) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  var details = {
    from: 'iplayon.in@gmail.com',
    to: data.to ? data.to : "shalini.krishnan90@gmail.com",
    //cc: [],
    subject: data.subject,
    text: data.content,
  };
  if (data.attachments) details["attachments"] = data.attachments
  console.log("details here " + JSON.stringify(details))
  return new Promise((resolve, reject) => {
    sgMail.send(details, function (error, result) {
      if (error) {
        console.log("mail error .. " + error)
        resolve(true)
      }
      else {
        resolve(true);
      }
    });
  }) 
}
module.exports = common
