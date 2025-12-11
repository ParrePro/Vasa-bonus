import nodemailer from 'nodemailer';

// Create a transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD, // Use App Password, not regular password
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  console.log('sendEmail called with:', { to: options.to, subject: options.subject });
  console.log('Email config:', { 
    user: process.env.GMAIL_USER, 
    hasPassword: !!process.env.GMAIL_APP_PASSWORD 
  });
  
  // Skip if email is not configured
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.log('Email not configured. Skipping email send.');
    return false;
  }

  try {
    console.log('Attempting to send email...');
    await transporter.sendMail({
      from: `"VasaBonus" <${process.env.GMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    console.log(`Email sent successfully to ${options.to}`);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

// Email templates
export function getRewardRequestEmail(studentName: string, rewardTitle: string, className: string): { subject: string; html: string } {
  return {
    subject: `🎁 New Reward Request - ${rewardTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
            .header h1 { color: #1e3a5f; margin: 0; font-size: 24px; }
            .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            .highlight { background: #FEF3C7; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .button { display: inline-block; background: #1e3a5f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏫 VasaBonus</h1>
            </div>
            <div class="content">
              <h2>New Reward Request!</h2>
              <p>Hello,</p>
              <p>You have a new reward request that needs your attention.</p>
              
              <div class="highlight">
                <p><strong>Student:</strong> ${studentName}</p>
                <p><strong>Reward:</strong> ${rewardTitle}</p>
                <p><strong>Class:</strong> ${className}</p>
              </div>
              
              <p>Please log in to VasaBonus to review and fulfill this request.</p>
              
              <a href="${process.env.FRONTEND_URL || 'http://localhost:8080'}" class="button">Go to VasaBonus</a>
            </div>
            <div class="footer">
              <p>This is an automated message from VasaBonus.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}

export function getCampaignRequestEmail(studentName: string, campaignTitle: string, className: string): { subject: string; html: string } {
  return {
    subject: `🚀 New Campaign Request - ${campaignTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
            .header h1 { color: #1e3a5f; margin: 0; font-size: 24px; }
            .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            .highlight { background: #DBEAFE; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .button { display: inline-block; background: #1e3a5f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏫 VasaBonus</h1>
            </div>
            <div class="content">
              <h2>New Campaign Join Request!</h2>
              <p>Hello,</p>
              <p>A student wants to join one of your campaigns.</p>
              
              <div class="highlight">
                <p><strong>Student:</strong> ${studentName}</p>
                <p><strong>Campaign:</strong> ${campaignTitle}</p>
                <p><strong>Class:</strong> ${className}</p>
              </div>
              
              <p>Please log in to VasaBonus to approve this request.</p>
              
              <a href="${process.env.FRONTEND_URL || 'http://localhost:8080'}" class="button">Go to VasaBonus</a>
            </div>
            <div class="footer">
              <p>This is an automated message from VasaBonus.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}

export function getRewardReminderEmail(studentName: string, rewardTitle: string, className: string, daysPending: number): { subject: string; html: string } {
  return {
    subject: `⏰ Reminder: Pending Reward Request - ${rewardTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #F87171 0%, #DC2626 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
            .header h1 { color: #fff; margin: 0; font-size: 24px; }
            .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            .highlight { background: #FEE2E2; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .urgent { background: #FEF3C7; padding: 10px 15px; border-radius: 6px; border-left: 4px solid #F59E0B; margin: 15px 0; }
            .button { display: inline-block; background: #DC2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏰ VasaBonus Reminder</h1>
            </div>
            <div class="content">
              <h2>Pending Reward Request</h2>
              <p>Hello,</p>
              
              <div class="urgent">
                <strong>This reward request has been pending for ${daysPending} days.</strong>
              </div>
              
              <p>A student is waiting for their reward to be fulfilled.</p>
              
              <div class="highlight">
                <p><strong>Student:</strong> ${studentName}</p>
                <p><strong>Reward:</strong> ${rewardTitle}</p>
                <p><strong>Class:</strong> ${className}</p>
              </div>
              
              <p>Please log in to VasaBonus to fulfill this request.</p>
              
              <a href="${process.env.FRONTEND_URL || 'http://localhost:8080'}" class="button">Fulfill Now</a>
            </div>
            <div class="footer">
              <p>This is an automated reminder from VasaBonus.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}

export function getCampaignReminderEmail(studentName: string, campaignTitle: string, className: string, daysPending: number): { subject: string; html: string } {
  return {
    subject: `⏰ Reminder: Pending Campaign Request - ${campaignTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #F87171 0%, #DC2626 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
            .header h1 { color: #fff; margin: 0; font-size: 24px; }
            .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            .highlight { background: #DBEAFE; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .urgent { background: #FEF3C7; padding: 10px 15px; border-radius: 6px; border-left: 4px solid #F59E0B; margin: 15px 0; }
            .button { display: inline-block; background: #DC2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏰ VasaBonus Reminder</h1>
            </div>
            <div class="content">
              <h2>Pending Campaign Request</h2>
              <p>Hello,</p>
              
              <div class="urgent">
                <strong>This campaign request has been pending for ${daysPending} days.</strong>
              </div>
              
              <p>A student is waiting to join a campaign.</p>
              
              <div class="highlight">
                <p><strong>Student:</strong> ${studentName}</p>
                <p><strong>Campaign:</strong> ${campaignTitle}</p>
                <p><strong>Class:</strong> ${className}</p>
              </div>
              
              <p>Please log in to VasaBonus to approve this request.</p>
              
              <a href="${process.env.FRONTEND_URL || 'http://localhost:8080'}" class="button">Approve Now</a>
            </div>
            <div class="footer">
              <p>This is an automated reminder from VasaBonus.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}

// Email verification template
export function getVerificationEmail(verificationCode: string): { subject: string; html: string } {
  return {
    subject: '🔐 Verify Your VasaBonus Account',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .code-box { background: white; border: 2px solid #667eea; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; }
            .code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 4px; font-family: 'Courier New', monospace; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
            .warning { color: #e74c3c; font-size: 14px; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to VasaBonus!</h1>
            </div>
            <div class="content">
              <p>Thank you for creating a VasaBonus account! To complete your registration and start using the platform, please verify your email address.</p>
              
              <p>Your verification code is:</p>
              
              <div class="code-box">
                <div class="code">${verificationCode}</div>
              </div>
              
              <p>Enter this code in the verification screen to activate your account.</p>
              
              <div class="warning">
                ⚠️ This code will expire in 24 hours.
              </div>
              
              <p>If you didn't create this account, you can safely ignore this email.</p>
              
              <div class="footer">
                <p>This is an automated email from VasaBonus. Please do not reply to this message.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}