import nodemailer from "nodemailer";
import { companyInfo } from "@/constants/companyInfo";

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.MAIL_USER,
		pass: process.env.MAIL_PASS,
	},
});

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
