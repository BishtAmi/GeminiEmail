import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' from the token
  console.log("token", token);

  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({
      access_token: token,
    });
    const gmail = google.gmail({ version: "v1", auth });
    const response = await gmail.users.messages.list({
      userId: "me",
      maxResults: 10,
    });
    const mail = response.data.messages || [];
    const messages = await Promise.all(
      mail.map(async (msg) => {
        const email = await gmail.users.messages.get({
          userId: "me",
          id: msg.id||"",
        });
        // console.log("email",email.data);
        return email.data;
      })
    );
    return NextResponse.json({ messages });
  } catch (error) {
    console.error("error from backend", error);
    return NextResponse.json({ error: "error" }, { status: 500 });
  }
}
