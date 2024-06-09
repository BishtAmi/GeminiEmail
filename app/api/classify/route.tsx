import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
export const POST = async (req: NextRequest) => {
  try {
    const { emails, API_KEY } = await req.json();
    const API = API_KEY ? API_KEY : process.env.API_KEY;
    const genAI = new GoogleGenerativeAI(API);
    console.log("API",API);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    if (!emails || !Array.isArray(emails)) {
      return NextResponse.json(
        { error: "Invalid email data" },
        { status: 400 }
      );
    }

    const messages = await Promise.all(
      emails.map(async (email) => {
        const prompt = `
      Classify the following email based on the examples below:
      
      Email: ${email.snippet}

      Examples:
      Important: Emails that are personal or work-related and require immediate attention.
      Promotions: Emails related to sales, discounts, and marketing campaigns.
      Social: Emails from social networks, friends, and family.
      Marketing: Emails related to marketing, newsletters, and notifications.
      Spam: Unwanted or unsolicited emails.
      General: If none of the above are matched, use General
      Classification:`;

        try {
          const result = await model.generateContent(prompt);
          const response = await result.response;
          const text = await response.text();

          email.classify = text.trim();
          console.log("classify", email.classify);
          return email;
        } catch (error) {
          console.error("Error generating content:", error);
          email.classify = "General"; // Default classification in case of error
          return email;
        }
      })
    );

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
