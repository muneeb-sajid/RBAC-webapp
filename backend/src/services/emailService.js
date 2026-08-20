import transporter from "../config/mail.js";

export async function sendEmail({ to, subject, html }) {
  try {
    const info = await transporter.sendMail({
      from: `"Sentinel System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("Email Sent:", info.messageId);

    return info;
  } catch (err) {
    console.log("Email Failed:", err.message);
    throw err;
  }
}