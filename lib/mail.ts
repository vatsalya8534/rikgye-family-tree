import nodemailer from "nodemailer";
import { prisma } from "@/lib/db/prisma-helper";

export async function sendMail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) { 
  const settings = await prisma.settings.findFirst();
 
  if (!settings) {
    throw new Error("Settings not found in DB");
  }

  if (!settings.isSMTP) {
    throw new Error("SMTP is disabled");
  }

  if (!settings.host || typeof settings.host !== "string") {
    throw new Error("Invalid SMTP host");
  }
 
  const host = settings.host.trim();
  const port = Number(settings.port) || 587;
  const user = settings.username || "";
  const pass = settings.password || "";
 
  const transporter = nodemailer.createTransport({
    host,  
    port,
    secure: port === 465,  
    auth: {
      user,
      pass,
    },
  });
 
  return transporter.sendMail({
    from: `${settings.siteTitle || "App"} <${user}>`,
    to,
    subject,
    html,
  });
}