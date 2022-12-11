const axios = require('axios');
module.exports = class SMS {
    constructor(mobileNum) {
        this.mobileNum = mobileNum;
    }
    async sendSms(otp) {
        try {
            await axios.post("https://cvt-whiz.herokuapp.com/sms", {
                "op":"postSms",
                "smsTo": this.mobileNum,
                "senderId":"6029fd3db65ab90015de4983",
                "smsTxt": "Your verification code is " + otp + ". This is only valid for 5 minutes and can be used only once. \n Team Datasport"
            })
            .then(res => {
                // console.log('response', res);
            })
            .catch(err => {
                console.log('error', err);
            });
        } catch(err) {
            console.log(err);
        }
    }
}