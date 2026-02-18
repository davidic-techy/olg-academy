import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Verify connection configuration
  try {
    await transporter.verify();
  } catch (err) {
    console.error("Nodemailer Setup Error:", err);
    throw new Error("Email setup is incorrect");
  }

  const mailOptions = {
    from: `OLG Nova Academy <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    html: `
      <h1>Hello ${options.name},</h1>
      <p>Your access to <b>${options.courseName}</b> has been granted!</p>
      <a href="${options.url}" style="background: #457B9D; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Enter Classroom</a>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;