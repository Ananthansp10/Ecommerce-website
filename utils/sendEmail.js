const nodemailer = require('nodemailer');

const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

const sendEmail = async (email, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.MY_EMAIL,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        await transporter.sendMail({
            from: process.env.MY_EMAIL,
            to: email,
            subject: subject,
            text: text
        });

        console.log('Email sent successfully');
    } catch (error) {
        console.log('Email not sent');
        console.error(error);
    }
};

module.exports = {
    sendEmail,
    generateOTP
};
