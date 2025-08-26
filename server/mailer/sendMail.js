const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");

handlebars.registerHelper('if_eq', function(a, b, opts) {
    return (a === b) ? opts.fn(this) : opts.inverse(this);
});

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
    // const html = compiled({ fName: replacements.fName, lName: replacements.lName, username: replacements.username, });
    // const html = compiled({...replacements});
    const html = compiled(replacements);
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


// // CALLING ON SIGN UP, EXAMPLE
//     sendMail({
//         to: "demo@demo.com",
//         subject: "Welcome to Cartify🎉",
//         template: "welcome.hbs",
//         replacements: { fName: "Aryan", lName: "Vaghasiya", username: "aryan", loginLink: "http://localhost:5173/login" }
//     })
//         .catch(err => {
//             console.error("Failed to send welcome email:", err);
//         });

// // CALLING ON ORDER PLACED, EXAMPLE
//     sendMail({
//         to: "demo@demo.com",
//         subject: "Order Confirmed🎉",
//         template: "order-confirmation.hbs",
//         replacements: {
//     "items": [
//         {
//             "id": 3,
//             "title": "Powder Canister",
//             "description": "The Powder Canister is a finely milled setting powder designed to set makeup and control shine. With a lightweight and translucent formula, it provides a smooth and matte finish.",
//             "rating": 4.64,
//             "brand": "Velvet Touch",
//             "thumbnail": "/uploads/products/3/thumbnail.jpg",
//             "created_on": "2025-07-11T10:18:15.000Z",
//             "last_updated": "2025-08-02T04:50:09.000Z",
//             "status": "active",
//             "category_id": 1,
//             "cid": 1,
//             "category": "beauty",
//             "quantity": 2,
//             "mrp": 14.99,
//             "discount": 0,
//             "stock": 45,
//             "discount_type": null,
//             "offer_discount": null,
//             "price": 14.99,
//             "priceValue": 29.98,
//             "coupon_discount": 3
//         },
//         {
//             "id": 9,
//             "title": "Dolce Shine Eau de",
//             "description": "Dolce Shine by Dolce & Gabbana is a vibrant and fruity fragrance, featuring notes of mango, jasmine, and blonde woods. It's a joyful and youthful scent.",
//             "rating": 3.96,
//             "brand": "Dolce & Gabbana",
//             "thumbnail": "/uploads/products/9/thumbnail.jpg",
//             "created_on": "2025-07-11T10:18:15.000Z",
//             "last_updated": "2025-08-02T04:50:09.000Z",
//             "status": "active",
//             "category_id": 2,
//             "cid": 2,
//             "category": "fragrances",
//             "quantity": 2,
//             "mrp": 69.99,
//             "discount": 0,
//             "stock": 96,
//             "discount_type": null,
//             "offer_discount": null,
//             "price": 69.99,
//             "priceValue": 139.98
//         }
//     ],
//     "noOfItems": 4,
//     "cartValue": 169.96,
//     "discountValue": 3,
//     "newCartValue": 166.96
// } }
//     )
//         .catch(err => {
//             console.error("Failed to send welcome email:", err);
//         });