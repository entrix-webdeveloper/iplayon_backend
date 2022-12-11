//const nodemailer = require('nodemailer');
// const pug = require('pug');
// const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    // this.url = url;
    this.from = `OTP <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // sendgrid
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD
        }
      });
    }
    return nodemailer.createTransport({
      name: process.env.EMAIL_NAME,
      host: process.env.EMAIL_HOST,
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAILPASSWORD
      }
      //Activate ingmail "less secure app" option
    });
  }

  // Send the actual email
  async send(otp) {
    // 1) Render HTML based on a pug template
    // const html = pug.renderFile(
    //   `${__dirname}/../views/emails/${template}.pug`,
    //   {
    //     firstName: this.firstName,
    //     // url: this.url,
    //     subject
    //   }
    // );
    // 2) Defaine email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: 'OTP Verification',
      // html,
      text: 'You are receiving this because you (or someone else) have requested OTP verification for your account.\n\n' +
        'Please enter the following OTP to verify your email address: \n\n' +
        otp + '\n\n' +
        'If you did not request this, please ignore this email..\n'
    };
    // 3) Create transport and send email
    await this.newTransport().sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log('error', err);
        return;
      }
      console.log(info);
    });
  }

  // async sendWelcome() {
  //   await this.send('welcome', 'Welcome to the Natours Family');
  // }

  // async sendPasswordReset() {
  //   await this.send(
  //     'passwordReset',
  //     'Your password rest token (valid only 10 minutes)'
  //   );
  // }
};
