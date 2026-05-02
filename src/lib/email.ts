// src/lib/email.ts
import nodemailer from 'nodemailer'

// Create transporter
export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// Send OTP Email
export async function sendOTPEmail(
  to: string,
  name: string,
  otpCode: string
): Promise<void> {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: 'Verify Your Email - AppointEase',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #667eea; margin: 20px 0; border-radius: 8px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📅 AppointEase</h1>
            <p>Verify Your Email Address</p>
          </div>
          <div class="content">
            <h2>Hello ${name}! 👋</h2>
            <p>Thank you for signing up with AppointEase. To complete your registration, please verify your email address using the OTP below:</p>
            
            <div class="otp-box">
              ${otpCode}
            </div>
            
            <p><strong>This OTP will expire in 10 minutes.</strong></p>
            
            <p>If you didn't create an account with AppointEase, please ignore this email.</p>
            
            <p>Best regards,<br>The AppointEase Team</p>
          </div>
          <div class="footer">
            <p>© 2024 AppointEase. All rights reserved.</p>
            <p>Built for Odoo Hackathon @ VIT Pune</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }

  await transporter.sendMail(mailOptions)
}

// Send Booking Confirmation Email
export async function sendBookingConfirmationEmail(
  to: string,
  name: string,
  bookingDetails: {
    appointmentName: string
    date: string
    time: string
    location: string
    confirmationCode: string
  }
): Promise<void> {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: 'Booking Confirmed - AppointEase',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .booking-card { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 5px; }
          .booking-card h3 { margin-top: 0; color: #667eea; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .detail-label { font-weight: bold; color: #666; }
          .confirmation-code { background: #667eea; color: white; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 2px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Booking Confirmed!</h1>
          </div>
          <div class="content">
            <h2>Hello ${name}! 👋</h2>
            <p>Your appointment has been successfully booked.</p>
            
            <div class="booking-card">
              <h3>📅 Booking Details</h3>
              <div class="detail-row">
                <span class="detail-label">Service:</span>
                <span>${bookingDetails.appointmentName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span>${bookingDetails.date}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Time:</span>
                <span>${bookingDetails.time}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Location:</span>
                <span>${bookingDetails.location}</span>
              </div>
            </div>
            
            <p><strong>Your Confirmation Code:</strong></p>
            <div class="confirmation-code">
              ${bookingDetails.confirmationCode}
            </div>
            
            <p>Please save this confirmation code for your records.</p>
            
            <p>Best regards,<br>The AppointEase Team</p>
          </div>
          <div class="footer">
            <p>© 2024 AppointEase. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }

  await transporter.sendMail(mailOptions)
}
