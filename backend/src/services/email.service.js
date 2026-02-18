import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // 1. Create a transporter (Use Mailtrap for testing, Gmail/Sendgrid for production)
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 2. Define email options
  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html, // Professional HTML templates
  };

  // 3. Actually send the email
  const info = await transporter.sendEmail(message);

  console.log('Message sent: %s', info.messageId);
};

export default sendEmail;