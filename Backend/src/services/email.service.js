import nodeMailer from "nodemailer";
import config from "../configs/config.js";

const { CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN, ACCESS_TOKEN, GOOGLE_ID } = config;

const transporter = nodeMailer.createTransport({
	service: "gmail",
	auth: {
		type: "OAuth2",
		user: GOOGLE_ID,
		clientId: CLIENT_ID,
		clientSecret: CLIENT_SECRET,
		refreshToken: REFRESH_TOKEN,
	},
});

transporter.verify((error, success) => {
	if (error) {
		console.log("Error setting up email transporter:", error);
	} else {
		console.log("Email transporter is ready to send messages");
	}
});

const sendEmailLocal = async (to, subject, text, html) => {
	const mailOptions = {
		from: `Banking-Ledger <${GOOGLE_ID}>`,
		to,
		subject,
		text,
		html,
	};

	try {
		const sentInfo = await transporter.sendMail(mailOptions);
		console.log("Email sent successfully:");
		return sentInfo;
	} catch (error) {
		console.error("Error sending email:", error);
		return null;
	}
};

const buildEmailTemplate = ({ title, subtitle, bodyHtml, accent = "#6C63FF" }) => `
	<div style="margin:0;padding:0;background:#0b1020;font-family:Arial,Helvetica,sans-serif;color:#e9efff;">
		<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px 12px;background:linear-gradient(145deg,#0b1020 0%,#121a31 60%,#101d43 100%);">
			<tr>
				<td align="center">
					<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#0f1730;border:1px solid rgba(255,255,255,0.12);border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.35);">
						<tr>
							<td style="padding:22px 24px;background:linear-gradient(135deg,${accent},#59b6ff);">
								<p style="margin:0;font-size:12px;letter-spacing:1px;font-weight:700;color:#ffffffcc;text-transform:uppercase;">Banking Ledger</p>
								<h1 style="margin:10px 0 0;font-size:22px;line-height:1.3;color:#fff;">${title}</h1>
							</td>
						</tr>
						<tr>
							<td style="padding:22px 24px 10px;color:#dbe7ff;font-size:15px;line-height:1.7;">
								<p style="margin:0 0 12px;color:#b7c3ea;">${subtitle}</p>
								${bodyHtml}
							</td>
						</tr>
						<tr>
							<td style="padding:14px 24px 22px;color:#9db0e6;font-size:12px;line-height:1.5;">
								<p style="margin:0;">Need help? Reply to this email and our support team will assist you.</p>
								<p style="margin:8px 0 0;">© ${new Date().getFullYear()} Banking-Ledger. All rights reserved.</p>
							</td>
						</tr>
					</table>
				</td>
			</tr>
		</table>
	</div>
`;

export const sendRegistrationEmail = async (userEmail, userName) => {
	const subject = "Welcome to Banking-Ledger";
	const text = `Hi ${userName},\n\nWelcome to Banking-Ledger! We're excited to have you on board.\n\nBest regards,\nThe Banking-Ledger Team`;
	const html = buildEmailTemplate({
		title: "Welcome aboard! 🎉",
		subtitle: `Hi ${userName}, your secure banking workspace is now ready.`,
		bodyHtml: `
			<p style="margin:0 0 10px;">Thank you for joining <strong>Banking-Ledger</strong>. You can now manage accounts, track transactions, and securely transfer funds.</p>
			<div style="margin:14px 0 0;padding:12px 14px;border-radius:10px;background:rgba(89,182,255,0.14);border:1px solid rgba(89,182,255,0.35);">
				<p style="margin:0;color:#e9efff;"><strong>Tip:</strong> Add your account PIN carefully and keep it private.</p>
			</div>
		`,
		accent: "#32d296",
	});
    const info = await sendEmailLocal(userEmail, subject, text, html);
};

export const sendTransactionSuccessEmail = async (userEmail, userName, amount, transactionType, transactionId) => {
	const subject = "Transaction Alert from Banking-Ledger";
	const text = `Dear ${userName},\n\nA ${transactionType} of amount $${amount} has been processed on your account.\n\nTransaction ID: ${transactionId}\n\nBest regards,\nThe Banking-Ledger Team`;
	const html = buildEmailTemplate({
		title: "Transaction Successful ✅",
		subtitle: `Hi ${userName}, we have processed your ${transactionType.toLowerCase()} request.`,
		bodyHtml: `
			<div style="display:inline-block;margin:0 0 12px;padding:10px 12px;border-radius:10px;background:rgba(50,210,150,0.16);border:1px solid rgba(50,210,150,0.45);font-weight:700;color:#d6ffe9;">₹${amount}</div>
			<p style="margin:0 0 8px;"><strong>Type:</strong> ${transactionType}</p>
			<p style="margin:0 0 8px;"><strong>Transaction ID:</strong> ${transactionId}</p>
			<p style="margin:0;color:#b7c3ea;">If you didn’t initiate this, contact support immediately.</p>
		`,
		accent: "#32d296",
	});
    const info = await sendEmailLocal(userEmail, subject, text, html);
};

export const sendTransactionFailureEmail = async (userEmail, userName, amount, transactionType, transactionId) => {
	const subject = "Transaction Alert from Banking-Ledger";
	const text = `Dear ${userName},\n\nA ${transactionType} of amount $${amount} has failed to process on your account.\n\nTransaction ID: ${transactionId}\n\nBest regards,\nThe Banking-Ledger Team`;
	const html = buildEmailTemplate({
		title: "Transaction Failed ⚠️",
		subtitle: `Hi ${userName}, your ${transactionType.toLowerCase()} could not be completed.`,
		bodyHtml: `
			<div style="display:inline-block;margin:0 0 12px;padding:10px 12px;border-radius:10px;background:rgba(255,107,107,0.16);border:1px solid rgba(255,107,107,0.45);font-weight:700;color:#ffe0e0;">₹${amount}</div>
			<p style="margin:0 0 8px;"><strong>Type:</strong> ${transactionType}</p>
			<p style="margin:0 0 8px;"><strong>Transaction ID:</strong> ${transactionId}</p>
			<p style="margin:0;color:#b7c3ea;">Please verify your account details and try again.</p>
		`,
		accent: "#ff6b6b",
	});
    const info = await sendEmailLocal(userEmail, subject, text, html);
};

export const sendOTPEmail = async (userEmail, userName, otp) => {
	const subject = "Your OTP for Banking-Ledger";
	const text = `Hi ${userName},\n\nYour One-Time Password (OTP) is: ${otp}\n\nThis OTP is valid for 5 minutes.\n\nBest regards,\nThe Banking-Ledger Team`;
	const html = buildEmailTemplate({
		title: "Your OTP Code 🔐",
		subtitle: `Hi ${userName}, use the code below to continue securely.`,
		bodyHtml: `
			<div style="margin:6px 0 14px;padding:14px 12px;border-radius:12px;background:#0b1020;border:1px dashed rgba(89,182,255,0.6);text-align:center;">
				<span style="display:inline-block;font-size:28px;letter-spacing:6px;font-weight:800;color:#ffffff;">${otp}</span>
			</div>
			<p style="margin:0 0 8px;"><strong>Validity:</strong> 5 minutes</p>
			<p style="margin:0;color:#b7c3ea;">Never share this code with anyone.</p>
		`,
		accent: "#7c5cff",
	});
	const info = await sendEmailLocal(userEmail, subject, text, html);
};

export const sendProfileEditedEmail = async (userEmail, userName) => {
	const subject = "Profile Updated - Banking-Ledger";
	const text = `Hi ${userName},\n\nYour profile has been updated successfully.\n\nIf you did not make this change, please contact our support team immediately.\n\nBest regards,\nThe Banking-Ledger Team`;
	const html = buildEmailTemplate({
		title: "Profile Updated",
		subtitle: `Hi ${userName}, we detected changes to your profile.`,
		bodyHtml: `
			<p style="margin:0 0 10px;">Your profile details were updated successfully.</p>
			<div style="margin:12px 0 0;padding:12px 14px;border-radius:10px;background:rgba(255,188,102,0.16);border:1px solid rgba(255,188,102,0.42);">
				<p style="margin:0;color:#fff4dc;"><strong>Security notice:</strong> If this wasn't you, reset your password immediately and contact support.</p>
			</div>
		`,
		accent: "#ffbc66",
	});
	const info = await sendEmailLocal(userEmail, subject, text, html);
}

export const sendPasswordResetEmail = async (userEmail, userName) => {
	const subject = "Password Reset Successful - Banking-Ledger";
	const text = `Hi ${userName},\n\nYour password has been reset successfully.\n\nIf you did not perform this action, please contact our support team immediately.\n\nBest regards,\nThe Banking-Ledger Team`;
	const html = buildEmailTemplate({
		title: "Password Reset Successful",
		subtitle: `Hi ${userName}, your password was changed successfully.`,
		bodyHtml: `
			<p style="margin:0 0 10px;">Your account password has been reset.</p>
			<div style="margin:12px 0 0;padding:12px 14px;border-radius:10px;background:rgba(255,107,107,0.16);border:1px solid rgba(255,107,107,0.45);">
				<p style="margin:0;color:#ffe0e0;"><strong>Security notice:</strong> If this wasn't you, reset your password immediately and contact support.</p>
			</div>
		`,
		accent: "#ff6b6b",
	});
	const info = await sendEmailLocal(userEmail, subject, text, html);
}

export const sendPinResetSuccessEmail = async (userEmail, userName, accountId) => {
	const subject = "PIN Reset Successful - Banking-Ledger";
	const text = `Hi ${userName},\n\nThe PIN for your account (ID: ${accountId}) has been reset successfully.\n\nIf you did not perform this action, please contact our support team immediately.\n\nBest regards,\nThe Banking-Ledger Team`;
	const html = buildEmailTemplate({
		title: "PIN Reset Successful",
		subtitle: `Hi ${userName}, the PIN for your account was reset successfully.`,
		bodyHtml: `
			<p style="margin:0 0 10px;">The PIN for your account (ID: ${accountId}) has been reset.</p>
			<div style="margin:12px 0 0;padding:12px 14px;border-radius:10px;background:rgba(255,107,107,0.16);border:1px solid rgba(255,107,107,0.45);">
				<p style="margin:0;color:#ffe0e0;"><strong>Security notice:</strong> If this wasn't you, reset your PIN immediately and contact support.</p>
			</div>
		`,
		accent: "#ff6b6b",
	});
	const info = await sendEmailLocal(userEmail, subject, text, html);
}