import nodemailer from "nodemailer";

export default async function handler(req, res) {
  // CORS setup
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,POST");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-relay-secret"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "GET") {
    return res.status(200).json({ status: "ok", service: "SkillSync AI Email Relay" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { to, subject, text, html, secret } = req.body || {};

  const expectedSecret = process.env.EMAIL_RELAY_SECRET || "skillsync-relay-secret-2026";
  const providedSecret = secret || req.headers["x-relay-secret"];

  if (providedSecret !== expectedSecret) {
    return res.status(401).json({ error: "Unauthorized email relay request" });
  }

  if (!to || !subject) {
    return res.status(400).json({ error: "Missing required fields: to and subject" });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "siddhantrajliwalda@gmail.com",
        pass: "yrgqngaiidsbssqj",
      },
      tls: {
        rejectUnauthorized: true,
      },
    });

    const info = await transporter.sendMail({
      from: '"SkillSync AI" <siddhantrajliwalda@gmail.com>',
      to,
      subject,
      text: text || "",
      html: html || text || "",
    });

    console.log(`Email dispatched to ${to}: ${info.messageId}`);
    return res.status(200).json({
      success: true,
      messageId: info.messageId,
    });
  } catch (error) {
    console.error("Vercel email relay dispatch error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to dispatch email",
    });
  }
}
