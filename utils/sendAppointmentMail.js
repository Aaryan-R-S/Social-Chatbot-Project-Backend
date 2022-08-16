const nodemailer = require("nodemailer");
require("dotenv").config();

const mailId = process.env.MAIL_ID;
const mailPwd = process.env.MAIL_PASSWORD;
const adminMail = process.env.ADMIN_MAIL;

const transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: mailId,
        pass: mailPwd,
    },
});

module.exports.sendAppointmentMail = (myUser, questionnaire) => {
    transport
        .sendMail({
            from: mailId,
            to: adminMail,
            subject: "Social Chatbot | New Appointment",
            html: `<h2>Dear admin,</h2>
        <p>User ${myUser.name} has booked an appointment with you! PFA the questionnaire submitted by them:</p>

        <h3>Questionnaire: </h3>
        ${questionnaire.map((s, i) => {
            return (`<p>
                Q${i + 1}). ${s.questionTxt}
                <br>
                Answer. ${s.answer}
            </p>`);
        }).join("")}
        <p>Please confirm the appointment by replying them @<a href=mailto:${myUser.email}>${myUser.email}</a>!</p>

        <p>Best Regards,<br>
        Team Social Chatbot</p>`,
        })
        .catch((err) => console.log(err));
};
