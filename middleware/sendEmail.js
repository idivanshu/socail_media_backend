
const nodeMailer = require('nodemailer');

exports.sendEmail = async (options) => {

    const transporter = nodeMailer.createTransport({
        // host: process.env.SMPT_HOST,
        // port: process.env.SMPT_PORT,
        // auth: {
        //     user: process.env.SMPT_EMAIL,
        //     pass: process.env.SMPT_PASSWORD,
        // },

        // service: process.env.SMPT_SERVICE,


        // mailtrap.io is a fake SMTP server for development
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "f4f3fabed66077",
          pass: "08b96a6b134faa"
        } 

    });

    const mailOptions = {
        from: process.env.SMPT_EMAIL,
        to: options.email,
        subject: options.subject,
        text: options.message,

    }
    await transporter.sendMail(mailOptions);
}
