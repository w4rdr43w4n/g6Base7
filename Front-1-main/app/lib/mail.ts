import { Resend } from "resend";
import URLS from "../config/urls";
import KEYS from "../config/config";
const resend = new Resend(KEYS.RESEND_API_KEY);

export async function sendVerificationMail(
  email: string,
  token: string,
  username: string,
  expDur: number
) {
  try {
    console.log(email)
    const verifyUrl = new URL(URLS.urls.verif);
    verifyUrl.searchParams.append("token", token);
    verifyUrl.searchParams.append("email", email);

    const data = await resend.emails.send({
      from: "G6 Account <G6Account@chatg6.ai>",
      to: [`${email}`],
      subject: "Email verification",
      html: `<p>Dear user: ${username} <br/> Please verify your <strong>G6 Account </strong> email <a href='${verifyUrl.toString()}'>Here</a></p><br/>Note that this token will expire within ${expDur} minutes.`,
    });
    if (data) return Response.json({ data: data.data }, { status: 200 });
    return Response.json({ error: "The email is not sent" }, { status: 226 });
  } catch (error) {
    return Response.json({ error });
  }
}

export async function sendMail(
  email: string,
  subject: string,
  message: string,
  username: string
) {
  try {
    const data = await resend.emails.send({
      from: "G6 Account <G6Account@chatg6.ai>",
      to: [`${email}`],
      subject: `${subject}`,
      html: `<p>Dear user:<b> ${username}</b> ,<br/> <pre style='font-family:sans-serif;font-size:14px;'>${message}</pre>`,
    });
    if (data) return Response.json({ data: data.data }, { status: 200 });
    return Response.json({ error: "The email is not sent" }, { status: 226 });
  } catch (error) {
    return Response.json({ error });
  }
}
