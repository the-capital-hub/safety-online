import nodemailer from "nodemailer";
import { companyInfo } from "@/constants/companyInfo";

function toArray(value) {
        if (!value) {
                return [];
        }

        return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function hasInvoiceAttachment(attachments) {
        if (!Array.isArray(attachments) || attachments.length === 0) {
                return false;
        }

        return attachments.some((attachment) => {
                if (!attachment || typeof attachment !== "object") {
                        return false;
                }

                const filename = String(attachment.filename || "").toLowerCase();
                const contentType = String(attachment.contentType || "").toLowerCase();
                const path = String(attachment.path || "").toLowerCase();

                const isPdf =
                        filename.endsWith(".pdf") ||
                        path.endsWith(".pdf") ||
                        contentType === "application/pdf";

                if (!isPdf) {
                        return false;
                }

                return filename.includes("invoice") || path.includes("invoice");
        });
}

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

export async function sendMail({ to, subject, html, attachments, cc, bcc }) {
        const defaultCc = toArray(companyInfo.ccEmails);
        const providedCc = toArray(cc);
        const mergedCc = Array.from(new Set([...defaultCc, ...providedCc]));

        const defaultBcc = toArray(companyInfo.bccEmails);
        const providedBcc = toArray(bcc);
        const mergedBcc = [...defaultBcc, ...providedBcc];

        if (hasInvoiceAttachment(attachments) && Array.isArray(companyInfo.invoiceEmails)) {
                mergedBcc.push(...companyInfo.invoiceEmails);
        }

        const finalCc = mergedCc.length > 0 ? mergedCc : undefined;
        const finalBcc = mergedBcc.length > 0 ? Array.from(new Set(mergedBcc)) : undefined;

        return transporter.sendMail({
                from: process.env.MAIL_USER,
                to,
                cc: finalCc,
                bcc: finalBcc,
                subject,
                html,
                attachments,
        });
}
