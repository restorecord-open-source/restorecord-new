import Email from "@sendgrid/mail";
if (process.env.SENDGRID_API_KEY)
    Email.setApiKey(process.env.SENDGRID_API_KEY as string);

export default Email;