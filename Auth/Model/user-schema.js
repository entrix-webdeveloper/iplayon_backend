const crypto = require("crypto");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: function() {
            return new mongoose.Types.ObjectId();
        }
    },
    name: {
        type: String,
        lowercase:true,
        required: [true, "Please tell us your name"]
    },
    lName: {
        type: String,
        lowercase:true,
        required: [false, "Please tell us your last name"]
    },
    mobile: {
        type: String,
        required: [true, "Please enter your mobile number"],
        unique: true
        // lowercase: true,
        // validate: [validator.isEmail, 'Please provide a valid email']
    },
    role: {
        type: String,
        enum: ["user", "super-admin", "vendor", "admin"],
        default: "user"
    },
    photo: { type: String, default: "default.jpg" },

    // password: {
    //   type: String,
    //   required: [true, 'Please provide a password'],
    //   minlength: 8,
    //   select: false
    // },
    // passwordConfirm: {
    //   type: String,
    //   required: [true, 'Please cofnrm your password'],
    //   validate: {
    //     validator: function (el) {
    //       return el === this.password;
    //     },
    //     message: 'Paswword are not the same'
    //   }
    // },
    // passwordChangedAt: Date,
    // passwordResetToken: String,
    // passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
});

// userSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) return next();

//   this.password = await bcrypt.hash(this.password, 12);
//   this.passwordConfirm = undefined;
// });

// userSchema.pre('save', function (next) {
//   if (!this.isModified('password') || this.isNew) return next();

//   this.passwordChangedAt = Date.now() - 1000;
//   next();
// });

userSchema.pre(/^find/, function(next) {
    // this point to current query
    this.find({ active: { $ne: false } });
    next();
});

// userSchema.methods.correctPassword = async function (
//   candidatePassword,
//   userPassword
// ) {
//   return await bcrypt.compare(candidatePassword, userPassword);
// };

// userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
//   if (this.passwordChangedAt) {
//     const changedTimeStamp = parseInt(
//       this.passwordChangedAt.getTime() / 1000,
//       10
//     );
//     return JWTTimestamp < changedTimeStamp;
//   }

//   return false;
// };

// userSchema.methods.createPasswordResetToken = function () {
//   const resetToken = crypto.randomBytes(32).toString('hex');
//   this.passwordResetToken = crypto
//     .createHash('sha256')
//     .update(resetToken)
//     .digest('hex');

//   console.log({ resetToken }, this.passwordResetToken);

//   this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
//   return resetToken;
// };

const User = mongoose.model("User", userSchema);

module.exports = User;
