import { db } from '@/database/drizzle';
import { users } from '@/database/schema';
import { sendEmail } from '@/lib/workflow';
import { serve } from '@upstash/workflow/nextjs';
import { eq } from 'drizzle-orm';

type UserState = 'non-active' | 'active';
type InitialData = {
  email: string;
  fullName: string;
};

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;
const THREE_DAY_IN_MS = 3 * ONE_DAY_IN_MS;
const THIRTY_DAY_IN_MS = 30 * ONE_DAY_IN_MS;

const getUserState = async (email: string): Promise<UserState> => {
  // get the user and see if the last activity date is today
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (user.length === 0) return 'non-active';

  const lastActivityDate = new Date(user[0].lastActivityDate!);
  const now = new Date();

  const timeDiff = now.getTime() - lastActivityDate.getTime();

  if (timeDiff > THREE_DAY_IN_MS && timeDiff <= THIRTY_DAY_IN_MS)
    return 'non-active';

  return 'active';
};

export const { POST } = serve<InitialData>(async (context) => {
  const { email, fullName } = context.requestPayload;

  // Welcome email
  await context.run('new-signup', async () => {
    await sendEmail({
      email,
      subject: 'Welcome to the platform',
      message: `
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
              }
              .email-container {
                width: 100%;
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                overflow: hidden;
              }
              .header {
                background-color: #4CAF50;
                color: #ffffff;
                text-align: center;
                padding: 20px 0;
                font-size: 24px;
                font-weight: bold;
              }
              .content {
                padding: 30px;
                text-align: center;
                color: #333333;
                font-size: 16px;
              }
              .content h2 {
                color: #4CAF50;
              }
              .cta-button {
                background-color: #4CAF50;
                color: #ffffff;
                padding: 10px 20px;
                border-radius: 5px;
                text-decoration: none;
                font-weight: bold;
                margin-top: 20px;
                display: inline-block;
              }
              .footer {
                background-color: #f4f4f4;
                text-align: center;
                padding: 15px;
                font-size: 12px;
                color: #888888;
              }
            </style>
          </head>
          <body>
            <div class="email-container">
              <div class="header">
                Welcome to the Platform!
              </div>
              <div class="content">
                <h2>Hi ${fullName},</h2>
                <p>Welcome to our platform! We're excited to have you on board.</p>
                <a href="https://university1977.vercel.app" class="cta-button">Get Started</a>
              </div>
              <div class="footer">
                <p>&copy; 2025 Your Company. All rights reserved.</p>
                <p>If you have any questions, feel free to contact us.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });
  });

  await context.sleep('wait-for-3-days', 60 * 60 * 24 * 3);

  while (true) {
    const state = await context.run('check-user-state', async () => {
      return await getUserState(email);
    });

    if (state === 'non-active') {
      await context.run('send-email-non-active', async () => {
        await sendEmail({
          email,
          subject: 'Are you still there?',
          message: `
  <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 30px;">
    <div style="max-width: 600px; margin: auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      
      <img src="https://i.imgur.com/Um5JZ2b.png" alt="We miss you" style="width: 100%; height: auto;" />

      <div style="background-color: #2563eb; color: white; padding: 20px 30px;">
        <h1 style="margin: 0; font-size: 24px;">We Miss You, ${fullName}!</h1>
      </div>

      <div style="padding: 30px;">
        <p style="font-size: 16px; color: #333;">
          It's been a while since we last saw you, and we just wanted to check in.
        </p>
        <p style="font-size: 16px; color: #333;">
          There’s a lot waiting for you on our platform — new features, updates, and a community that’s eager to have you back!
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://university1977.vercel.app" 
             style="background-color: #2563eb; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold;">
            Come Back Now
          </a>
        </div>
        <p style="font-size: 14px; color: #6b7280;">
          If you have any questions or need help, feel free to reply to this email.
        </p>
      </div>

      <div style="background-color: #f3f4f6; padding: 20px 30px; text-align: center; font-size: 12px; color: #9ca3af;">
        © ${new Date().getFullYear()} OP TALHA | All rights reserved.
      </div>
    </div>
  </div>
`,
        });
      });
    } else if (state === 'active') {
      await context.run('send-email-active', async () => {
        await sendEmail({
          email,
          subject: 'Welcome back to the platform',
          message: `
  <div style="font-family: Arial, sans-serif; background-color: #f3f4f6; padding: 30px;">
    <div style="max-width: 600px; margin: auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.08);">
      
      <img src="https://i.imgur.com/gP5hOaA.png" alt="Welcome back!" style="width: 100%; height: auto;" />

      <div style="background-color: #10b981; color: white; padding: 20px 30px;">
        <h1 style="margin: 0; font-size: 24px;">Welcome Back, ${fullName}!</h1>
      </div>

      <div style="padding: 30px;">
        <p style="font-size: 16px; color: #111827;">
          We're thrilled to see you again. You’ve been missed!
        </p>
        <p style="font-size: 16px; color: #374151;">
          We’ve been working hard to improve your experience. New features, smarter tools, and more community fun are waiting for you.
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="https://university1977.vercel.app" 
             style="background-color: #10b981; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold;">
            Explore What's New
          </a>
        </div>

        <p style="font-size: 14px; color: #6b7280;">
          Need help? Just reply to this email — we're always here for you.
        </p>
      </div>

      <div style="background-color: #f9fafb; padding: 20px 30px; text-align: center; font-size: 12px; color: #9ca3af;">
        © ${new Date().getFullYear()} OP TALHA | All rights reserved.
      </div>
    </div>
  </div>
`,
        });
      });
    }

    await context.sleep('wait-for-1-month', 60 * 60 * 24 * 30);
  }
});
