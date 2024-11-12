const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: "ngohoangkim2002@gmail.com",
    pass: "rums gqcm hmcm prsy",
  },
});

module.exports = async (to, subject, content) => {
  const info = await transporter.sendMail({
    from: '"Domitory Management System" <ngohoangkim2002@gmail.com>', // sender address
    to, // list of receivers
    subject, // Subject line
    html: content, // html body
    replyTo: "ngohoangkim2002@gmail.com",
  });
  return info;
};
