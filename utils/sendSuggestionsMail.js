const nodemailer = require("nodemailer");
require("dotenv").config();

const mailId = process.env.MAIL_ID;
const mailPwd = process.env.MAIL_PASSWORD;

const transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: mailId,
        pass: mailPwd,
    },
});

module.exports.sendSuggestionsMail = (myUser, suggestionsArr, videosArr) => {
    transport
        .sendMail({
            from: mailId,
            to: myUser.email,
            subject: "Social Chatbot | Suggestions and Videos",
            html: `<h2>Dear ${myUser.name},</h2>
        <p>PFA some suggestions and links to youtube videos on the basis of the questionnaire submitted by you which is accessible from your dashboard!</p>

        <h3>Suggestions:</h3>
        ${suggestionsArr.map((s, i) => {
            return (`<p>
                ${i + 1}. ${s}
            </p>`);
        }).join("")}

        <h3>YouTube Videos:</h3>
        ${videosArr.map((v, i) => {
            return (`<p><a href=${v}>
                ${i + 1}. ${v}
            </a></p>`);
        }).join("")}

        <p>We hope that these suggestions and videos will be helpful for you.</p>
        <p>Good Luck!</p>
        <p>Best Regards,<br>
        Team Social Chatbot</p>`,
        })
        .catch((err) => console.log(err));
};
