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

export const sendRegistrationEmail = async (userEmail, userName) => {
	const subject = "Welcome to Banking-Ledger";
	const text = `Hi ${userName},\n\nWelcome to Banking-Ledger! We're excited to have you on board.\n\nBest regards,\nThe Banking-Ledger Team`;
	const html = `
        <p>Hi ${userName},</p>
        <p>Welcome to Banking-Ledger! We're excited to have you on board.</p>
        <p>Best regards,<br>The Banking-Ledger Team</p>
    `;
    const info = await sendEmailLocal(userEmail, subject, text, html);
};

export const sendTransactionSuccessEmail = async (userEmail, userName, amount, transactionType, transactionId) => {
	const subject = "Transaction Alert from Banking-Ledger";
	const text = `Dear ${userName},\n\nA ${transactionType} of amount $${amount} has been processed on your account.\n\nTransaction ID: ${transactionId}\n\nBest regards,\nThe Banking-Ledger Team`;
	const html = `
        <p>Dear ${userName},</p>
        <p>A ${transactionType} of amount ₹${amount} has been processed on your account.</p>
        <p>Transaction ID: ${transactionId}</p>
        <p>Best regards,<br>The Banking-Ledger Team</p>
    `;
    const info = await sendEmailLocal(userEmail, subject, text, html);
};

export const sendTransactionFailureEmail = async (userEmail, userName, amount, transactionType, transactionId) => {
	const subject = "Transaction Alert from Banking-Ledger";
	const text = `Dear ${userName},\n\nA ${transactionType} of amount $${amount} has failed to process on your account.\n\nTransaction ID: ${transactionId}\n\nBest regards,\nThe Banking-Ledger Team`;
	const html = `
		<p>Dear ${userName},</p>
		<p>A ${transactionType} of amount ₹${amount} has failed to process on your account.</p>
		<p>Transaction ID: ${transactionId}</p>
		<p>Best regards,<br>The Banking-Ledger Team</p>
    `;
    const info = await sendEmailLocal(userEmail, subject, text, html);
};