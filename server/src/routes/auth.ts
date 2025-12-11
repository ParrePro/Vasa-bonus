import { Router } from 'express';
import { registerUser, loginUser, generateToken, authMiddleware, comparePassword } from '../auth';
import { query } from '../db';
import { AuthRequest } from '../auth';
import { sendEmail, getVerificationEmail } from '../email';

const router = Router();

// Generate a 6-digit verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user exists
    const existingUser = await query(
      `SELECT id FROM profiles WHERE id IN (SELECT id FROM auth_users WHERE email = $1)`,
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const userId = await registerUser(email, password, name);
    
    // Generate verification code
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Save verification code to database
    await query(
      `UPDATE profiles SET verification_code = $1, verification_code_expires_at = $2, is_verified = false WHERE id = $3`,
      [verificationCode, expiresAt, userId]
    );

    // Send verification email
    const { subject, html } = getVerificationEmail(verificationCode);
    await sendEmail({ to: email, subject, html });

    res.json({
      user: { id: userId, email, name },
      message: 'Verification code sent to email. Please verify your account.',
      requiresVerification: true,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Verify email code
router.post('/verify-email', async (req, res) => {
  try {
    const { email, verificationCode } = req.body;

    if (!email || !verificationCode) {
      return res.status(400).json({ error: 'Missing email or verification code' });
    }

    // Find user by email
    const authResult = await query(
      `SELECT id FROM auth_users WHERE email = $1`,
      [email]
    );

    if (authResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = authResult.rows[0].id;

    // Check verification code
    const profileResult = await query(
      `SELECT verification_code, verification_code_expires_at, is_verified FROM profiles WHERE id = $1`,
      [userId]
    );

    if (profileResult.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const profile = profileResult.rows[0];

    if (profile.is_verified) {
      return res.status(400).json({ error: 'Account already verified' });
    }

    if (profile.verification_code !== verificationCode) {
      return res.status(401).json({ error: 'Invalid verification code' });
    }

    if (new Date(profile.verification_code_expires_at) < new Date()) {
      return res.status(401).json({ error: 'Verification code expired' });
    }

    // Mark as verified
    await query(
      `UPDATE profiles SET is_verified = true, verification_code = NULL, verification_code_expires_at = NULL WHERE id = $1`,
      [userId]
    );

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    const user = await loginUser(email, password);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if email is verified
    const profileResult = await query(
      `SELECT name, is_verified FROM profiles WHERE id = $1`,
      [user.id]
    );

    if (profileResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const profile = profileResult.rows[0];

    if (!profile.is_verified) {
      return res.status(403).json({ 
        error: 'Email not verified',
        requiresVerification: true,
        email: user.email
      });
    }

    const token = generateToken(user.id, user.email);

    res.json({
      user: { id: user.id, email: user.email, name: profile.name },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/logout', authMiddleware, (req: AuthRequest, res) => {
  // Just acknowledge the logout - client will clear the token
  res.json({ message: 'Logged out' });
});

router.get('/me', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const result = await query(
      `SELECT id, email FROM auth_users WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    const profileResult = await query(
      `SELECT name FROM profiles WHERE id = $1`,
      [userId]
    );

    res.json({
      id: user.id,
      email: user.email,
      name: profileResult.rows[0]?.name || 'Unknown',
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Delete account endpoint
router.delete('/delete-account', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const { password } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    // Verify password
    const userResult = await query(
      `SELECT password FROM auth_users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const passwordMatch = await comparePassword(password, userResult.rows[0].password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    // Delete in order to respect foreign key constraints
    // First, delete campaign-related data
    await query(`DELETE FROM campaign_participations WHERE student_id = $1`, [userId]);
    await query(`DELETE FROM campaign_classes WHERE campaign_id IN (SELECT id FROM campaigns WHERE created_by = $1)`, [userId]);
    await query(`DELETE FROM campaigns WHERE created_by = $1`, [userId]);

    // Delete reward-related data
    await query(`DELETE FROM reward_purchases WHERE student_id = $1`, [userId]);
    await query(`DELETE FROM reward_classes WHERE reward_id IN (SELECT id FROM rewards WHERE created_by = $1)`, [userId]);
    await query(`DELETE FROM rewards WHERE created_by = $1`, [userId]);

    // Delete messages
    await query(`DELETE FROM messages WHERE student_id = $1 OR teacher_id = $1`, [userId]);

    // Delete points transactions
    await query(`DELETE FROM points_transactions WHERE student_id = $1 OR teacher_id = $1`, [userId]);

    // Delete class memberships
    await query(`DELETE FROM class_members WHERE user_id = $1`, [userId]);
    
    // Delete classes where user is the mentor (CASCADE will handle related records)
    await query(`DELETE FROM classes WHERE mentor_id = $1`, [userId]);

    // Delete user roles
    await query(`DELETE FROM user_roles WHERE user_id = $1`, [userId]);

    // Delete profile
    await query(`DELETE FROM profiles WHERE id = $1`, [userId]);

    // Delete auth user
    await query(`DELETE FROM auth_users WHERE id = $1`, [userId]);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

export default router;
