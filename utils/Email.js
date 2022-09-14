const nodemailer = require("nodemailer");
class Email {
  constructor(user) {
    this.name = user.name;
    this.to = user.email;
    this.from = `Muhammad Gamal ${process.env.EMAIL_FROM}`;
  }
  transporter() {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  async send(subject, text) {
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      text,
    };
    await this.transporter().sendMail(mailOptions);
  }

  async sendVerificationEmail(text) {
    await this.send(`Verify your Account`, text);
  }
  async sendPasswordReset(text) {
    await this.send(`Reset your Password`, text);
  }
}
module.exports = Email;
