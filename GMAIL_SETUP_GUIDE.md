# Gmail SMTP Setup for Revolution Travel Email Service

## Overview
We've switched from Resend to Gmail SMTP using Nodemailer to send emails to any recipient without domain verification requirements.

## Setup Instructions

### 1. Gmail Account Setup
1. Use your Gmail account or create a dedicated one for the business
2. **Enable 2-Factor Authentication** (required for App Passwords)
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable 2-Step Verification

### 2. Generate App Password
1. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
2. Select "Mail" as the app
3. Select "Other" as the device and enter "Revolution Travel Website"
4. Copy the generated 16-character password

### 3. Environment Variables
Create a `.env.local` file in your project root:

```env
GMAIL_USER=your-business-email@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password
```

**Important:** 
- Use the Gmail App Password, NOT your regular Gmail password
- Keep these credentials secure and never commit them to version control

### 4. Recommended Gmail Account
For production, consider creating a dedicated Gmail account like:
- `noreply@revolutiontravel.gmail.com` or similar
- This keeps business emails organized

## Features

### ✅ Advantages over Resend
- ✅ Send to ANY email address (no domain verification needed)
- ✅ No recipient restrictions
- ✅ Familiar Gmail reliability
- ✅ Free for reasonable volumes
- ✅ Better deliverability for business emails

### 📧 Email Features
- Professional sender name: "Revolution Travel Services"
- Reply-to functionality (clients can reply directly)
- Plain text and HTML versions
- Professional headers to avoid spam
- Automatic error handling

### 🔒 Security Features
- Secure SMTP connection
- App Password authentication
- Professional email headers
- Unsubscribe header compliance

## Usage
The API will automatically:
1. Send quote request to agency email (ivan.tomdieu@gmail.com)
2. Send confirmation to client
3. Handle errors gracefully
4. Log email sending status

## Testing
1. Fill out the form on the website
2. Check that both emails are sent
3. Verify emails land in inbox (not spam)
4. Test reply functionality

## Troubleshooting

### Common Issues
1. **Authentication Error**: Verify App Password is correct
2. **Less Secure Apps**: Not needed with App Passwords
3. **2FA Required**: Must enable 2-Factor Authentication first
4. **Rate Limits**: Gmail allows ~500 emails/day for free accounts

### Error Messages
- `Invalid login`: Wrong email or App Password
- `Authentication failed`: Enable 2FA and create App Password
- `Daily sending quota exceeded`: Wait 24 hours or upgrade to Gmail Business

## Production Recommendations
1. Use a dedicated Gmail account for the business
2. Consider Gmail Workspace for custom domain (e.g., support@revolutiontravel.cm)
3. Monitor sending volumes
4. Keep backup email service configuration ready

## Environment Variables Reference
```env
# Required
GMAIL_USER=your-email@gmail.com          # Your Gmail address
GMAIL_APP_PASSWORD=abcd1234efgh5678      # 16-character App Password

# Optional (for future use)
# BACKUP_SMTP_HOST=smtp.example.com
# BACKUP_SMTP_USER=user@example.com
# BACKUP_SMTP_PASS=password
```
