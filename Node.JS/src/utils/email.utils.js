'use strict';

const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    port: 25,
    host: 'localhost',
    tls: {
        rejectUnauthorized: false,
    },
});

export function sendRegistrationEmail(
    receiverEmail,
    receiverName,
    activationToken
) {
    transporter.sendMail(
        {
            from: 'noreply@hobby.local',
            to: receiverEmail,
            subject: 'Regisztráció visszaigazolása - ITSH applikáció',
            html: `<p style="font-size: 14px; font-weight: bold;">Kedves ${receiverName}!</p>
            <p style="font-size: 12px; font-weight: normal; line-height: 2em;">Sikeresen regisztráltál az ITSH alkalamazásába. Üdvözlünk a fedélezeten!<br />
            Kattints a <a style="color: red; text-decoration: none" href="http://localhost:3000/api/v1/user/activation/${activationToken}">LINKRE</a> a profilod aktiválásához. Ha a link nem elérhető, kattints az alábbi linkre: 
              <br /> PUBLIC LINK: http://localhost:3000/api/v1/user/activation/${activationToken}
              <br /> ANGULAR LINK: http://localhost:4200/user/activation/${activationToken}
              <br /> ANDROID1 LINK: http://10.0.2.2/user/activation/${activationToken}
              <br /> ANDROID2 LINK: http://192.168.29.11/user/activation/${activationToken}
            </p>`,
        },
        function (error, info) {
            if (error) console.log(`Error details: ${error}`);
            console.log(
                `Registration of new user was sucessful. Activation email was sent to the email address.`
            );
        }
    );
}

export function sendPasswordResetEmail(receiverEmail, resetToken) {
    transporter.sendMail(
        {
            from: 'noreply@hobby.local',
            to: receiverEmail,
            subject: 'Jelszó frissítése - ITSH applikáció',
            html: `<p style="font-size: 14px; font-weight: bold;">Kedves kolléga (${receiverEmail})!</p>
            <p style="font-size: 12px; font-weight: normal; line-height: 2em;">Kérésednek megfelelően küldjük a belépési jelszód frissítéséhez kapcsolódó információkat!<br />
            A link a kéréstől számított hat óráig érvényes.<br />
            Kattints a <a style="color: red; text-decoration: none" href="http://localhost:3000/api/v1/user/reset-password/${resetToken}">LINKRE</a> a jelszód frissítéséhez. Ha a link nem elérhető, kattints az alábbi linkre: 
              <br /> PUBLIC LINK: http://localhost:3000/api/v1/user/reset-password/${resetToken}
              <br /> ANGULAR LINK: http://localhost:4200/user/reset-password/${resetToken}
              <br /> ANDROID1 LINK: http://10.0.2.2/api/v1/user/reset-password/${resetToken}
              <br /> ANDROID2 LINK: http://192.168.29.114/api/v1/user/reset-password/${resetToken}
            </p>`,
        },
        function (error, info) {
            if (error) console.log(`Error details: ${error}`);
            console.log(
                `User requested password reset. Email with the link was sent to the email address.`
            );
        }
    );
}
