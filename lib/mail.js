import nodemailer from "nodemailer";
import { companyInfo } from "@/constants/companyInfo";

function normalizeAddressList(value) {
        if (!value) {
                return [];
        }

        const list = Array.isArray(value) ? value : [value];

        return list
                .map((entry) => {
                        if (typeof entry === "string") {
                                const trimmed = entry.trim();
                                return trimmed.length > 0 ? trimmed : null;
                        }

                        if (entry && typeof entry === "object") {
                                return entry;
                        }

                        return null;
                })
                .filter(Boolean);
}

function mergeRecipientLists(...lists) {
        const merged = [];
        const seen = new Set();

        for (const list of lists) {
                if (!Array.isArray(list)) continue;

                for (const entry of list) {
                        if (!entry) continue;

                        if (typeof entry === "string") {
                                const key = entry.toLowerCase();
                                if (seen.has(key)) continue;
                                seen.add(key);
                                merged.push(entry);
                                continue;
                        }

                        if (entry && typeof entry === "object") {
                                const key = entry.address
                                        ? entry.address.toLowerCase()
                                        : JSON.stringify(entry);
                                if (seen.has(key)) continue;
                                seen.add(key);
                                merged.push(entry);
                        }
                }
        }

        return merged;
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

const defaultCcRecipients = normalizeAddressList(companyInfo.ccEmails);
const defaultBccRecipients = normalizeAddressList(companyInfo.bccEmails);

export function createMailTransport() {
        return nodemailer.createTransport({
                ...mailBaseConfig,
                auth: mailAuthConfig,
        });
}

const transporter = createMailTransport();

export async function sendMail({
        to,
        cc,
        bcc,
        subject,
        text,
        html,
        attachments,
        replyTo,
        metadata,
} = {}) {
        const toRecipients = mergeRecipientLists(normalizeAddressList(to));
        const ccRecipients = mergeRecipientLists(
                normalizeAddressList(cc),
                defaultCcRecipients
        );
        const bccRecipients = mergeRecipientLists(
                normalizeAddressList(bcc),
                defaultBccRecipients
        );

        if (toRecipients.length === 0) {
                throw new Error("No recipient email address provided");
        }

        try {
                return await transporter.sendMail({
                        from: process.env.MAIL_USER,
                        to: toRecipients,
                        cc: ccRecipients.length > 0 ? ccRecipients : undefined,
                        bcc: bccRecipients.length > 0 ? bccRecipients : undefined,
                        subject,
                        text,
                        html,
                        attachments,
                        replyTo,
                });
        } catch (error) {
                console.error("[MAILER_ERROR]", {
                        subject,
                        to: toRecipients,
                        cc: ccRecipients,
                        bcc: bccRecipients,
                        message: error?.message,
                        code: error?.code,
                        command: error?.command,
                        metadata,
                });

                if (error && typeof error === "object") {
                        error.emailContext = {
                                subject,
                                to: toRecipients,
                                cc: ccRecipients,
                                bcc: bccRecipients,
                                metadata,
                        };
                }

                throw error;
        }
}
