const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../Model/user-schema");
const catchAsync = require("./../../utils/catchAsync");
const AppError = require("../../utils/appError");
//const EMail = require('../../utils/email');
const SMS = require("../../utils/sms");
const otpLib = require("otplib");
// const { use } = require('../routes/auth-user-routes');
const userSecret = "HIUFR476G84RHEOI";
var validator = require("validate.js");


let createUserValidator = {
    type: { presence: { allowEmpty: false }, type: "string", inclusion: ["signup"] },
    otp: { presence: { allowEmpty: false }, type: "string", length: { is: 4 }, format: { pattern: "[0-9]+" } },
    name: { presence: { allowEmpty: false }, type: "string" },
    mobile: {
        presence: { allowEmpty: false }, type: "string", length: { is: 10 }, format: { pattern: "[0-9]+" },
    }
};


let loginUserValidator = {
    type: { presence: { allowEmpty: false }, type: "string", inclusion: ["login"] },
    id: { presence: { allowEmpty: false }, type: "string" },
    otp: { presence: { allowEmpty: false }, type: "string", length: { is: 4 }, format: { pattern: "[0-9]+" } },
};

let updatePhoneValidator = {
    type: { presence: { allowEmpty: false }, type: "string", inclusion: ["updatePhone"] },
    id: { presence: { allowEmpty: false }, type: "string" },
    otp: { presence: { allowEmpty: false }, type: "string", length: { is: 4 }, format: { pattern: "[0-9]+" } },
    mobile: {
        presence: { allowEmpty: false }, type: "string", length: { is: 10 }, format: { pattern: "[0-9]+" },
    }
};

function signToken(id) {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}

// function sendMail(user, userOtp) {
//   new EMail(user).send(userOtp);
// }

function sendSms(mobileNo, userOtp) {
    console.log("sms "+process.env.SEND_SMS+" ... "+mobileNo)
    if(process.env.SEND_SMS && process.env.SEND_SMS === '1')    {
        console.log("send sms")
        new SMS(mobileNo).sendSms(userOtp);
    }
    else{
        console.log("dont send sms");
        return true;
    }
}

function generateOtp() {
    otpLib.authenticator.options = {
        window: 30,
        digits: 4
    };
    const otp = otpLib.authenticator.generate(userSecret);
    return otp;
}

const createSendToken = (user, statusCode, req, res) => {
    const token = signToken(user._id);
    res.cookie("jwt", token, {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
        //secure: req.secure || req.headers('x-forwarded-proto') === 'https'
    });

    user.password = undefined;

    res.status(statusCode).json({
        status: "success",
        token,
        data: {
            user
        }
    });
};

const createToken = (user, statusCode, req, res) => {
    const token = signToken(user._id);
    res.cookie("jwt", token, {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
        //secure: req.secure || req.headers('x-forwarded-proto') === 'https'
    });

    user.password = undefined;

    return {
        statusCode: statusCode,
        status: true,
        token,
        result: user
    };
};

exports.customSendOtp = (req, res, next) => {
    //TODO generate OTP and send it to user store OTP on confirm signup and call create sendtoken
    let userOtp = generateOtp();
    sendSms(req.body.mobile, userOtp);
    return {
        statusCode: 201,
        status: true,
        proceed: true,
        sendStatus: true,
        result: { userOtp }
    };
}

exports.signup = catchAsync(async (req, res, next) => {
    //validate mobile number
    let isValidMobile = !validator.single(req.body.mobile, {
        presence: { allowEmpty: false },
        format: { pattern: "[0-9]+" },
        length: { is: 10 }
    });
    if (!isValidMobile) return next(new AppError("Invalid mobile no!", 400));
    //TODO generate OTP and send it to user store OTP on confirm signup and call create sendtoken
    const user = await User.findOne({ mobile: req.body.mobile });
    let userOtp;
    if (user) {
        return next(new AppError("User already exists!", 400));
    } else {
        userOtp = generateOtp();
        // newUser = await User.create({
        //   name: req.body.name,
        //   email: req.body.email,
        //   otpSecret: userOtp.secret,
        //   password: req.body.password,
        //   passwordConfirm: req.body.passwordConfirm,
        //   role: req.body.role
        // });
        // sendMail(newUser, userOtp);
        sendSms(req.body.mobile, userOtp);
    }
    //const url = `${req.protocol}://${req.get('host')}/me`;
    // createSendToken(newUser, 201, req, res);
    // const token = signToken(newUser._id);
    if (req.body.custom) {
        return {
            statusCode: 201,
            status: true,
            proceed: true,
            result: { userOtp }
        };
    } else {
        res.status(201).json({
            status: "success",
            message: "An OTP has been sent to your mobile number. Please check",
            data: { userOtp }
        });
    }
});


exports.login = catchAsync(async (req, res, next) => {
    // const { email, password } = req.body;

    // 1 if eail and password exists
    if (!req.body.mobile) {
        return next(new AppError("Please enter mobile number!", 400));
    }
    let isValidMobile = !validator.single(req.body.mobile, {
        presence: { allowEmpty: false },
        format: { pattern: "[0-9]+" },
        length: { is: 10 }
    });
    if (!isValidMobile) return next(new AppError("Invalid mobile no!", 400));

    const user = await User.findOne({ mobile: req.body.mobile });
    let activeUser;
    let userOtp;
    if (!user) {
        return next(
            new AppError("User not found. Please register first!", 400)
        );
    } else {
        userOtp = generateOtp();
    }
    // await new EMail(user).send(userOtp);
    // sendMail(user, userOtp);
    sendSms(req.body.mobile, userOtp);
    //const url = `${req.protocol}://${req.get('host')}/me`;
    // createSendToken(newUser, 201, req, res);
    // const token = signToken(newUser._id);
    res.status(201).json({
        status: "success",
        message: "An OTP has been sent to your mobile number. Please check",
        data: { id: user._id, otp: userOtp }
    });
    // 2 Chek if user exists and passseord is correct
    // const user = await User.findOne({ email }).select('+password');

    // if (!user || !(await user.correctPassword(password, user.password))) {
    //   return next(new AppError('Incorrect email or password!', 401));
    // }
    // 3) if everything is okey , then send webtoken back
    // const token = signToken(user._id);
    // res.status(200).json({
    //   status: 'success',
    //   token
    // });
});

exports.verifyOtp = async (req, res, next) => {
    try {
        let { type } = req.body;
        if (type == undefined)
            return next(new AppError("invalid-type", 400))

        //data type checks
        let entityValidator = []
        if (type === "signup") entityValidator = createUserValidator;
        if (type === "login") entityValidator = loginUserValidator
        if (type === "updatePhone") entityValidator = updatePhoneValidator
        let isValidData = validator(req.body, entityValidator);
        if (isValidData)
            return next(new AppError("invalid -" + Object.keys(isValidData)[0], 400))

        let isValid = otpLib.authenticator.verify({
            token: req.body.otp,
            secret: userSecret
        });
        if (req.body.otp === process.env.DEF_OTP) isValid = true
        if (isValid) {
            if (req.body.type === "signup") {
                const user = await User.create({
                    name: req.body.name,
                    mobile: req.body.mobile
                    // otpSecret: userOtp.secret,
                    // password: req.body.password,
                    // passwordConfirm: req.body.passwordConfirm,
                    // role: req.body.role
                });
                createSendToken(user, 200, req, res);
            } else if (req.body.type === "login") {
                const user = await User.findOne({ _id: req.body.id });
                if (!user)
                    return next(new AppError("invalid-id", 400));
                createSendToken(user, 200, req, res);
            }
            else if (req.body.type === "updatePhone") {
                const user = await this.updateProfile({ id: req.body.id, mobile: req.body.mobile });
                res.status(201).json({
                    status: "success",
                    message: "Your Phone Number has been changed",
                    result: user
                });
            }
        } else {
            res.status(401).json({ message: "Invalid OTP" });
        }
    } catch (err) {
        console.log(err);
        return next(new AppError(err, 500));
    }
};



exports.logout = (req, res) => {
    res.cookie("jwt", "loggedout", {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({ status: "success" });
};

let protectMethod = async (req, res, next, optionalAcc = []) => {
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        let tok = req.headers.authorization.split(" ")
        token = tok && tok[1] && tok[1] != 'undefined' ? tok[1] : "";
    } else if (req.cookies && req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    if (!token && req.body.op && optionalAcc.includes(req.body.op)) {
        res.locals.user = req.user = { _id: "optional" };
        return next();
    }
    if (!token) {
        return next(
            new AppError("You are not logged in, please login to contiue", 401)
        );
    }
    // 2) Validate token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) check if user still exists
    const freshUser = await User.findById(decoded.id);
    if (!freshUser) {
        return next(
            new AppError("The user belongong to toekn does not exists!", 401)
        );
    }
    // 4) check if user change passwords after JWT was issued
    // if (freshUser.changedPasswordAfter(decoded.iat)) {
    //     return next(
    //         new AppError(
    //             "User recently changed password, please login again",
    //             401
    //         )
    //     );
    // }
    req.user = freshUser;
    res.locals.user = freshUser;
    next();
}
exports.protectOptional = (req, res, next, optionalAcc) => {
    (async (req, res, next) => {
        await protectMethod(req, res, next, optionalAcc)
    })(req, res, next);
};

exports.protect = catchAsync(async (req, res, next) => {
    await protectMethod(req, res, next)
});

// Only for rendered pages no errors
exports.isLoogedIn = async (req, res, next) => {
    // 1) Getting token and check if it exists

    if (req.cookies.jwt) {
        try {
            // 1) Verifuies token
            const decoded = await promisify(jwt.verify)(
                req.cookies.jwt,
                process.env.JWT_SECRET
            );

            // 3) check if user still exists
            const freshUser = await User.findById(decoded.id);
            if (!freshUser) {
                return next();
            }
            // 4) check if user change passwords after JWT was issued
            if (freshUser.changedPasswordAfter(decoded.iat)) {
                return next();
            }
            // There is a logged in user
            res.locals.user = freshUser;
            return next();
        } catch (err) {
            return next();
        }
    }
    next();
};

//

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError("You do not have permission!", 403));
        }
        next();
    };
};

exports.restrictRole = (req, res, next, roleAcc, userOps = []) => {
    ((req, res, next) => {
        if (req.user && roleAcc && userOps) {
            let op = req.body.op;
            //set userId
            if (userOps.includes(op)) {
                req.body.userId = req.user._id;
            }
            //check role access
            if (roleAcc && roleAcc[op] != undefined && roleAcc[op] != null && !roleAcc[op].includes(req.user.role) &&
                req.user._id != "optional") {
                return next(new AppError("access denied !", 403));
            }
        }
        next();
    })(req, res, next);
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on POSTED email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(
            new AppError("There is no user with that email address!", 404)
        );
    }

    //2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) Sent it to user's email address

    try {
        const resetURL = `${req.protocol}://${req.get(
            "host"
        )}/api/v1/users/resetPassword/${resetToken}`;
        //console.log(resetURL);
        await new EMail(user, resetURL).sendPasswordReset();

        res.status(200).json({
            status: "success",
            message: "Token sent to email"
        });
    } catch (error) {
        user.createPasswordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        //console.log(error);
        return next(
            new AppError("There was an error sending email. Try again later"),
            500
        );
    }

    //next();
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on the token
    const hashedToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });
    // 2) If toeken not expired and there is user , set the new password
    if (!user) {
        return next(new AppError("Token is invalid or expired!", 400));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    //3 ) Update changePassAt properly for the user
    // 4) Log the user in and send JWT
    createSendToken(user, 201, req, res);
    // const token = signToken(user._id);
    // res.status(200).json({
    //   status: 'success',
    //   token
    // });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    // 1) Get user from thecollection
    const user = await User.findById(req.user.id).select("+password");

    // 2) Check if the posted password iscorrect
    if (!user.correctPassword(req.body.passwordCurrent, user.password)) {
        return next(new AppError("your current password is wrong", 401));
    }
    //3) if the password is correct then update the password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    //4) Log user in and send token
    createSendToken(user, 201, req, res);
});

exports.getUserByToken = async (req, res, next) => {
    // 1) Getting token and check if it exists
    let token;
    if (req.headers &&
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    if (!token) {
        return next(
            new AppError("You are not logged in, please login to contiue", 401)
        );
    }
    // 2) Validate token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    if (decoded.id) return decoded.id;
    return "";
};

/*
    The getUser method fetches user object  based on given .
    If a user object exists, the user is returned along with appropriate statusCode.
    Otherwise an appropriate error code is returned along with a false status
*/
exports.getUser = async u => {
    try {
        const user = await User.findById(u.id);
        if (user) {
            u.status = true;
            u.statusCode = 200;
            u.result = user;
        } else {
            u.status = false;
            u.statusCode = 404;
        }
        return u;
    } catch (err) {
        console.log(err);
        return { status: false, statusCode: 500 };
    }
};
/**
 * 
 * getUserByMobile method fetches user by mobile number
 */
exports.getUserByMobile = async u => {
    try {
        const user = await User.findOne({ mobile: u.mobile });
        if (user) {
            u.status = true;
            u.statusCode = 200;
            u.result = user;
        } else {
            u.status = false;
            u.statusCode = 404;
        }
        return u;
    } catch (err) {
        console.log(err);
        return { status: false, statusCode: 500 };
    }
};

/*
  The updateRole method updates the  user object 'role' field.
    If the operation is successful, the newly updated user object is returned
    If user object not found,404 error code is returned along with a false status
    If exception,500 error code is returned along with a false status and with exception errCode
*/
exports.updateRole = async u => {
    try {
        const user = await User.findByIdAndUpdate(u.id, { role: u.role });
        if (user) {
            u.status = true;
            u.statusCode = 200;
            u.result = user;
        } else {
            u.status = false;
            u.statusCode = 404;
        }
        return u;
    } catch (err) {
        console.log(err);
        return { status: false, statusCode: 500 };
    }
};


/*
  The updateProfile method updates the  user object  field.
    If the operation is successful, the newly updated user object is returned
    If user object not found,404 error code is returned along with a false status
    If exception,500 error code is returned along with a false status and with exception errCode
*/
exports.updateProfile = async u => {
    try {
        const user = await User.findByIdAndUpdate(u.id, { ...u });
        if (user) {
            u.status = true;
            u.statusCode = 200;
            u.result = user;
        } else {
            u.status = false;
            u.statusCode = 404;
        }
        return u;
    } catch (err) {
        console.log(err);
        return { status: false, statusCode: 500 };
    }
};

exports.verifyUserOtp = async (reqBody, req, res) => {
    try {
        let isValid = otpLib.authenticator.verify({
            token: reqBody.otp,
            secret: userSecret
        });
        if (reqBody.otp === process.env.DEF_OTP) isValid = true;

        if (isValid) {
            if (reqBody.type === "signup") {
                const user = await User.create({
                    name: reqBody.name,
                    mobile: reqBody.mobile
                });
                return createToken(user, 200, req, res);
            } else if (reqBody.type === "login") {
                const user = await User.findOne({ _id: reqBody.id });
                return createToken(user, 200, req, res);
            }
        } else {
            return { status: false, statusCode: 401, errCode: "invalid-otp", message: "Invalid OTP" };
        }
    } catch (err) {
        console.log(err);
        return { status: false, statusCode: 500 };
    }
};


exports.updatePhone = catchAsync(async (req, res, next) => {
    //validate mobile number
    let isValidMobile = !validator.single(req.body.mobile, {
        presence: { allowEmpty: false },
        format: { pattern: "[0-9]+" },
        length: { is: 10 }
    });

    if (!isValidMobile) return next(new AppError("Invalid mobile no!", 400));
    let token;
    if (req.headers &&
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    if (!token) {
        return next(
            new AppError("You are not logged in, please login to contiue", 401)
        );
    }
    // 2) Validate token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    //TODO generate OTP and send it to user store OTP on confirm signup and call create sendtoken
    const user = await User.findOne({ mobile: req.body.mobile, _id: { $ne: decoded.id } });
    let userOtp;
    if (user) {
        return next(new AppError("User already exists! with the mobile number provided", 400));
    } else {
        userOtp = generateOtp();
        // newUser = await User.create({
        //   name: req.body.name,
        //   email: req.body.email,
        //   otpSecret: userOtp.secret,
        //   password: req.body.password,
        //   passwordConfirm: req.body.passwordConfirm,
        //   role: req.body.role
        // });
        // sendMail(newUser, userOtp);
        sendSms(req.body.mobile, userOtp);

        //const url = `${req.protocol}://${req.get('host')}/me`;
        // createSendToken(newUser, 201, req, res);
        // const token = signToken(newUser._id);

        res.status(201).json({
            status: "success",
            message: "An OTP has been sent to your new mobile number. Please check",
            data: { id: decoded.id, otp: userOtp }
        });
    }
});