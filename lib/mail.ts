import nodemailer from 'nodemailer'

var transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "5b2bd83897dfa0",
    pass: "fd593e7f58bc8d"
  }
});

export async function sendMail({
    to,
    subject,
    html,
}: {
    to: string;
    subject: string;
    html: string;
}) {
    return transport.sendMail({
        from: `Rikhye <deepak@gmail.com>`,
        to,
        subject,
        html,
    });
}