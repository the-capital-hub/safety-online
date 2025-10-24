import nodemailer from "nodemailer";
import { companyInfo } from "@/constants/companyInfo";

const mailBaseConfig = process.env.MAIL_SERVICE
        ? { service: process.env.MAIL_SERVICE }
        : {
                  host: process.env.MAIL_HOST ?? "smtp.office365.com",
                  port: Number.parseInt(process.env.MAIL_PORT ?? "587", 10),
                  secure: process.env.MAIL_SECURE === "true",
          };

const mailAuthConfig = {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
};

export function createMailTransport() {
        return nodemailer.createTransport({
                ...mailBaseConfig,
                auth: mailAuthConfig,
        });
}

const transporter = createMailTransport();

export async function sendMail({ to, subject, html, attachments }) {
	const cc =
		companyInfo.ccEmails && companyInfo.ccEmails.length
			? companyInfo.ccEmails
			: undefined;
	const bcc =
		companyInfo.bccEmails && companyInfo.bccEmails.length
			? companyInfo.bccEmails
			: undefined;

	return transporter.sendMail({
		from: process.env.MAIL_USER,
		to,
		cc,
		bcc,
		subject,
		html,
		attachments,
	});
}
