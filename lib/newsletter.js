import { sendMail } from "./mail";
import { companyInfo } from "@/constants/companyInfo";

/**
 * Sends a welcome email to new newsletter subscribers
 * @param {string} email - The subscriber's email address
 * @returns {Promise} - The result of the email sending operation
 */
export async function sendWelcomeEmail(email) {
	const subject = "Welcome to Safety Online Newsletter!";
	// // background-color: #f9f9f9; border-radius: 5px;

	const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="text-align: left; padding: 20px;">
        <img src="${
					process.env.NEXT_PUBLIC_DOMAIN || "https://safetyonline.in"
				}/LogoSeller1.png" alt="Safety Online Logo" style="max-width: 200px;">
      </div>
      
      <div style="padding: 20px; padding-top: 0px;"> 
        <h2 style="color: #333; margin-bottom: 20px;">Thank You for Subscribing!</h2>
        
        <p style="color: #666; line-height: 1.6;">
          Hello,
        </p>
        
        <p style="color: #666; line-height: 1.6;">
          Thank you for subscribing to our newsletter. You'll now receive updates on our latest products, 
          exclusive offers, and safety tips directly to your inbox.
        </p>
        
        <p style="color: #666; line-height: 1.6;">
          If you have any questions or need assistance, please don't hesitate to contact our support team at 
          <a href="mailto:${
						companyInfo.supportEmail || "help@safetyonline.in"
					}" style="color: #0066cc;">${
		companyInfo.supportEmail || "help@safetyonline.in"
	}</a>.
        </p>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${
						process.env.NEXT_PUBLIC_DOMAIN || "https://safetyonline.in"
					}/products" 
             style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 4px;">
            Shop Now
          </a>
        </div>
      </div>
      
      <div style="padding: 20px; text-align: center; color: #999; font-size: 12px;">
        <p>© ${new Date().getFullYear()} Safety Online. All rights reserved.</p>
        <p>
          If you wish to unsubscribe, <a href="${
						process.env.NEXT_PUBLIC_DOMAIN || "https://safetyonline.in"
					}/unsubscribe?email=${email}" style="color: #0066cc;">click here</a>.
        </p>
      </div>
    </div>
  `;

	return sendMail({
		to: email,
		subject,
		html,
	});
}
