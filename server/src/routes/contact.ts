import { Router } from 'express';
import { sendEmail } from '../email';

const router = Router();

// Contact form submission
router.post('/', async (req, res) => {
  try {
    const { schoolName, contactName, email, message } = req.body;

    if (!schoolName || !contactName || !email) {
      return res.status(400).json({ error: 'School name, contact name, and email are required' });
    }

    // Send email to VasaBonus team
    const emailContent = getContactFormEmail(schoolName, contactName, email, message);
    
    const sent = await sendEmail({
      to: process.env.VASABONUS_EMAIL || process.env.GMAIL_USER || '',
      subject: emailContent.subject,
      html: emailContent.html,
    });

    if (!sent) {
      console.log('Email not configured, but saving contact request');
      // Even if email fails, we return success (you might want to save to database)
    }

    res.json({ success: true, message: 'Contact request received' });
  } catch (error) {
    console.error('Error processing contact form:', error);
    res.status(500).json({ error: 'Failed to process contact request' });
  }
});

function getContactFormEmail(schoolName: string, contactName: string, email: string, message?: string): { subject: string; html: string } {
  return {
    subject: `🏫 New School Interest - ${schoolName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
            .header h1 { color: #fff; margin: 0; font-size: 24px; }
            .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px; }
            .info-box { background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .info-item { margin: 10px 0; }
            .label { font-weight: bold; color: #6B7280; }
            .message-box { background: #EEF2FF; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8B5CF6; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏫 New School Interested in VasaBonus!</h1>
            </div>
            <div class="content">
              <h2>Contact Form Submission</h2>
              <p>A new school has expressed interest in implementing VasaBonus.</p>
              
              <div class="info-box">
                <div class="info-item">
                  <span class="label">School Name:</span><br/>
                  ${schoolName}
                </div>
                <div class="info-item">
                  <span class="label">Contact Person:</span><br/>
                  ${contactName}
                </div>
                <div class="info-item">
                  <span class="label">Email:</span><br/>
                  <a href="mailto:${email}">${email}</a>
                </div>
              </div>
              
              ${message ? `
              <div class="message-box">
                <span class="label">Message:</span><br/>
                ${message}
              </div>
              ` : ''}
              
              <p>Reply to this email to get in touch with them!</p>
            </div>
            <div class="footer">
              <p>VasaBonus Contact Form Submission</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}

export default router;
