# Classify Email Powered by Gemini AI

Classify Email is an app that uses Google OAuth and the Gemini AI API to classify your emails based on their importance. This helps you manage your inbox more efficiently. If you want to test this app, please drop your Gmail address to: singhbishtamit2@gmail.com

## Classification

Emails are classified into the following categories:

Important: Personal or work-related emails that require immediate attention.
Promotions: Emails related to sales, discounts, and marketing campaigns.
Social: Emails from social networks, friends, and family.
Marketing: Emails related to marketing, newsletters, and notifications.
Spam: Unwanted or unsolicited emails.
General: If none of the above categories match, the email is classified as General.

## Tech Stack:

Next.js
Google Authentication
Gmail API integration
Gemini API integration

## Deployment:

The app is deployed on Vercel.

# API Routes:

- **Description** : Authenticate user with Google
- **Method**: Google OAuth 2.0
- **Endpoint**: `/auth`
- **Response Status Code**: 200
- **Response Body**:
  ```json
  {
    "message": "User authenticated successfully"
  }
  ```
- **Description** : Fetch emails from user's Gmail account
- **Method**: GET
- **Endpoint**: `/emails`
- **Response Status Code**: 200
- **Response Body**:
  ```json
  {
    "emails": [
      // Array of latest 10 emails from user's account
    ]
  }
  ```
- **Description** : Classify emails based on predefined categories
- **Method**: POST
- **Endpoint**: `/classify`
- **Request Body**:

```json
{
  "emails": [
    // Array of emails from user's account
  ],
  "API_KEY": "your_gemini_api_key"
}
```
- **Response Status Code**: 200
- **Response Body**:
  ```json
  {
    "classified_emails": [
      {
        "email": {
          // Email object
        },
        "category": "Important"
      }
      // More classified emails...
    ]
  }
  ```
