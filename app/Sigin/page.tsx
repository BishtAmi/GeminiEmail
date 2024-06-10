"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
type Classification = {
  id: string;
  category: string;
};
declare module "next-auth" {
  interface Session {
    accessToken?: string;
  }
}
const SignIn = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [apiKey, setApiKey] = useState("");
  const [classifications, setClassifications] = useState<Classification[]>([]);
  useEffect(() => {
    if (session) {
      localStorage.setItem("token", JSON.stringify(session.accessToken));
    }
  }, [session]);

  const fetchEmails = async () => {
    router.push("/email");
  };
  const handelAPIkey = (event: any) => {
    setApiKey(event);
    console.log("Api at sign in", apiKey);
    localStorage.setItem("API_KEY", JSON.stringify(apiKey));
  };
  if (session) {
    return (
      <div className="page-container">
        <div className="box-container">
          {session.user && <h1>Welcome, {session.user.name}</h1>}
          <div className="button-container">
            <button className="fetch-button" onClick={fetchEmails}>
              Fetch Emails
            </button>
            <button className="auth-button" onClick={() => signOut()}>
              Sign out
            </button>
          </div>
          <input
            className="input-field"
            type="text"
            placeholder="Gemini API Key"
            value={apiKey}
            onChange={(event) => handelAPIkey(event?.target.value)}
          />
          <ul>
            {classifications.map((classification) => (
              <li key={classification.id}>{classification.category}</li>
            ))}
          </ul>
        </div>
        <style jsx>{`
          .page-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 80px;
            background-color: #000;
            color: #fff;
            font-family: Arial, sans-serif;
          }
          .box-container {
            background-color: #111;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            width: 100%;
            max-width: 400px;
            text-align: center;
          }
          h1 {
            margin-bottom: 20px;
          }
          .button-container {
            display: flex;
            gap: 10px; /* Space between buttons */
            margin-bottom: 20px;
            justify-content: center;
          }
          .auth-button,
          .fetch-button {
            background-color: #444;
            color: #fff;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
          }
          .auth-button:hover,
          .fetch-button:hover {
            background-color: #555;
          }
          .input-field {
            padding: 10px;
            margin: 10px 0;
            border: 1px solid #444;
            border-radius: 5px;
            background-color: #222;
            color: #fff;
            width: 100%;
            max-width: 300px;
            text-align: center;
          }
          ul {
            list-style-type: none;
            padding: 0;
          }
          li {
            background-color: #222;
            padding: 10px;
            margin: 5px 0;
            border-radius: 5px;
            border: 1px solid #444;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="box-container">
        <h1>Email Classifier</h1>
        <button className="auth-button" onClick={() => signIn("google")}>
          Continue with Google
        </button>
      </div>
      <style jsx>{`
        .page-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          padding: 80px;
          background-color: #000;
          color: #fff;
          font-family: Arial, sans-serif;
        }
        .box-container {
          background-color: #111;
          padding: 40px;
          border-radius: 10px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          width: 100%;
          max-width: 400px;
          text-align: center;
        }
        h1 {
          margin-bottom: 20px;
          font-size: 25px;
        }
        .auth-button {
          background-color: #444;
          color: #fff;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
        }
        .auth-button:hover {
          background-color: #555;
        }
      `}</style>
    </div>
  );
};

export default SignIn;
