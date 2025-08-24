const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});

/**
 * Send email using an HTML template
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.template - Template file (e.g., welcome.html)
 * @param {Object} options.replacements - Placeholder values { name: "Aryan", email: "a@b.com" }
 */



async function sendMail({ to, subject, template, replacements }) {
    const filePath = path.join(__dirname, "templates", template);
    const source = fs.readFileSync(filePath, "utf-8");

    const compiled = handlebars.compile(source);
    // console.log(compiled);
    const html = compiled({ fName: replacements.fName, lName: replacements.lName, username: replacements.username, });
    // console.log(html);

    const info = await transporter.sendMail({
        from: '"Cartify" <no-reply@cartify.com>',
        to,
        subject,
        html,
    });

    console.log("Message sent:", info.messageId);
    console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
    return info
}


// async function sendMail({ to, subject, template, replacements }) {
//     const templatePath = path.join(__dirname, "templates", template);
//     let html = fs.readFileSync(templatePath, "utf8");

//     for (const key in replacements) {
//         const regex = new RegExp(`{{${key}}}`, "g");
//         html = html.replace(regex, replacements[key]);
//     }

//     const info = await transporter.sendMail({
//         from: '"Cartify" <no-reply@cartify.com>',
//         to,
//         subject,
//         html,
//     });

//     console.log("Message sent:", info.messageId);
//     console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
//     return info
// }

module.exports = { sendMail };
