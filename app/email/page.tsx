"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../Navbar/page";
type EmailEntry = {
  snippet: string;
  classify: string;
  internalDate: string;
  id: string;
  payload: {
    headers: {
      name: string;
      value: string;
    }[];
    parts?: {
      mimeType: string;
      body: {
        data: string;
      };
    }[];
    body?: {
      data: string;
    };
  };
};
const EmailPage = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [emails, setEmails] = useState<EmailEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState<string | null>();
  const [showModal, setShowModal] = useState(false);
  const [selectedEmailBody, setSelectedEmailBody] = useState("");
  useEffect(() => {
    if (session) {
      const token = localStorage.getItem("token");
      setToken(token);
      fetchEmails();
    }
  }, [session]);

  function getBody(data: any): string {
    let messageBody: string = "";

    if (data.parts) {
      data.parts.forEach((part: any) => {
        if (part.mimeType === "text/plain" && part.body && part.body.data) {
          messageBody += Buffer.from(part.body.data, "base64").toString(
            "utf-8"
          );
        } else if (
          part.mimeType === "text/html" &&
          part.body &&
          part.body.data
        ) {
          messageBody += Buffer.from(part.body.data, "base64").toString(
            "utf-8"
          );
        } else if (part.parts) {
          messageBody += getBody(part);
        }
      });
    } else if (data.body && data.body.data) {
      messageBody = Buffer.from(data.body.data, "base64").toString("utf-8");
    }

    return messageBody;
  }

  const classifyMails = async () => {
    const API_KEY = localStorage.getItem("API_KEY");
    console.log("API_KEY",API_KEY);
    const res = await fetch("/api/classify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ emails: emails, API_KEY }),
    });
    const data = await res.json();

    setEmails(data.messages);
    console.log("classify", data.messages);
  };
  const fetchEmails = async () => {
    const token = localStorage.getItem("token");
    setToken(token);
    if (!token) {
      // setError("No token found");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/emails", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error("Failed to fetch emails");
      }
      const data = await res.json();
      console.log("email", data.messages);
      setEmails(data.messages);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatEmail = (input: string) => {
    let result = input.replace(/<\/?[^>]+(>|$)/g, "");
    // Step 2: Normalize spaces and line breaks
    result = result.replace(/\s+/g, " ").trim();
    // Step 3: Remove duplicate content
    // Split the string into sentences or meaningful chunks
    let sentences = result.split(/[.!?]\s*/);
    // Use a Set to keep track of unique sentences
    let uniqueSentences = new Set();
    let cleanedResult = sentences
      .filter((sentence) => {
        if (uniqueSentences.has(sentence)) {
          return false;
        } else {
          uniqueSentences.add(sentence);
          return true;
        }
      })
      .join(". ");
    // Return the cleaned text
    return cleanedResult;
  };
  const extractTextFromHtmlString = (htmlString: any) => {
    // Step 1: Remove HTML tags
    let cleaned = htmlString.replace(/<\/?[^>]+(>|$)/g, "");
    // Step 2: Remove CSS and inline styles
    cleaned = cleaned
      .replace(/(?:^|\s)\.[\w\-]+\s*\{[^}]*\}/g, "")
      .replace(/@media[^{]+\{([^}]*\{[^}]*\})+[^}]*\}/g, "")
      .replace(/style\s*=\s*".*?"/g, "")
      .replace(/class\s*=\s*".*?"/g, "");
    // Step 3: Normalize whitespace
    cleaned = cleaned.replace(/\s+/g, " ").trim();
    return cleaned;
  };
  const handelSignout = async () => {
    router.push("/Sigin");
  };
  const handelbody = (email: any) => {
    console.log("email", email.payload);
    const body = getBody(email.payload);
    const text = extractTextFromHtmlString(body);
    console.log("text extract", text);
    const final = formatEmail(text);
    console.log("body", final);
    setSelectedEmailBody(final);
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
  };
  return (
    <div className="page-container">
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-content">
              <h2>Email Body</h2>
              <p>{selectedEmailBody}</p>
              <button className="close-modal" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {!token ? (
        <>
          <button className="fetch-button" onClick={handelSignout}>
            Back to HomePage
          </button>
        </>
      ) : (
        <div>
          <Navbar />
          <button className="auth-button" onClick={handelSignout}>
            Sign out
          </button>
          <button className="fetch-button" onClick={classifyMails}>
            Classify Emails
          </button>
        </div>
      )}

      {loading && <p>Loading emails...</p>}
      <div className="emails-container">
        {emails.map((entry, email) => {
          const from = entry.payload.headers.find(
            (header) => header.name === "From"
          )?.value;
          const snippet = entry.snippet;
          const classify = entry.classify || "general";
          const date = new Date(parseInt(entry.internalDate)).toLocaleString();
          return (
            <div
              className="email-box"
              key={entry.id}
              onClick={() => handelbody(entry)}
            >
              <h3>{from}</h3>
              <span className={`classification ${classify.toLowerCase()}`}>
                {classify}
              </span>
              <p>{snippet}</p>
              <small>{date}</small>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .page-container {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          min-height: 100vh;
          padding: 80px;
          background-color: #000;
          color: #fff;
          font-family: Arial, sans-serif;
        }
        .auth-button,
        .fetch-button {
          background-color: #444;
          color: #fff;
          border: none;
          padding: 10px 20px;
          margin: 5px;
          border-radius: 5px;
          cursor: pointer;
        }
        .auth-button:hover,
        .fetch-button:hover {
          background-color: #555;
        }
        .emails-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
          max-width: 600px;
          margin: 20px 0;
        }
        .email-box {
          background-color: #222;
          padding: 16px;
          border-radius: 8px;
          border: 1px solid #444;
          color: #fff;
          position: relative;
        }
        .email-box h3 {
          margin: 0 0 10px;
          font-size: 20px;
        }
        .email-box p {
          margin: 0 0 8px;
        }
        .email-box small {
          display: block;
          margin-top: 8px;
          color: #888;
        }
        .classification {
          position: absolute;
          top: 16px;
          right: 16px;
          padding: 4px 8px;
          border-radius: 4px;
          color: #fff;
          font-size: 12px;
          text-transform: uppercase;
        }
        .classification.important {
          background-color: #28a745;
        }
        .classification.promotions {
          background-color: #ffc107;
        }
        .classification.social {
          background-color: #17a2b8;
        }
        .classification.marketing {
          background-color: #fd7e14;
        }
        .classification.spam {
          background-color: #dc3545;
        }
        .classification.general {
          background-color: #6c757d;
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 1000;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .modal {
          background-color: #222;
          padding: 20px;
          border-radius: 8px;
          max-width: 50%;
          overflow: auto;
        }

        .modal-content {
          color: #fff;
          max-height: 70vh;
          overflow-y: auto;
        }

        .close-modal {
          background-color: #444;
          color: #fff;
          border: none;
          padding: 10px 20px;
          margin-top: 20px;
          border-radius: 5px;
          cursor: pointer;
        }

        .close-modal:hover {
          background-color: red;
        }
      `}</style>
    </div>
  );
};

export default EmailPage;
