import Email from "@sendgrid/mail";
Email.setApiKey(process.env.SENDGRID_API_KEY as string);

export default Email;