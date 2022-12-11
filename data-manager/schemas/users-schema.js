const mongoose = require('mongoose');

const servicesSchema = {
  "password":{
    "bcrypt":{type:String}
  }
}

const usersSchema = new mongoose.Schema({
  emailAddress: { type: String },
  phoneNumber : { type: String },
  services:{ type: servicesSchema },
  userId: { type: String },
  profileSettingStatus : { type: Boolean},
  registerType : { type : String},
  role :{ type: String},
  userName : { type : String},
  userStatus : { type: String},
  verifiedBy : { type : [String]},
  interestedProjectName: { type: [String] },
})

const Users = mongoose.model('users', usersSchema, 'users');
module.exports = Users;
