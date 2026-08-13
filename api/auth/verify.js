const { OAuth2Client } = require('google-auth-library');
const { createClient }  = require('@supabase/supabase-js');
const jwt               = require('jsonwebtoken');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { credential } = req.body || {};
  if (!credential) return res.status(400).json({ error: 'No credential provided' });

  try {
    const gClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket  = await gClient.verifyIdToken({
      idToken:  credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const gp = ticket.getPayload();
    if (!gp.email_verified) return res.status(401).json({ error: 'Email not verified with Google' });

    const email   = gp.email.toLowerCase();
    const name    = gp.name    || email;
    const picture = gp.picture || '';

    const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
    const { data: admin, error } = await sb
      .from('allowed_admins')
      .select('*')
      .eq('email', email)
      .eq('status', 'active')
      .single();

    if (error || !admin) {
      return res.status(403).json({
        error: 'This Google account is not authorized to access the admin panel.',
        email
      });
    }

    const token = jwt.sign(
      { email: admin.email, role: admin.role, name, picture },
      process.env.SESSION_SECRET,
      { expiresIn: '24h' }
    );

    res.setHeader('Set-Cookie',
      `privatian_session=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=86400; Path=/`
    );

    return res.status(200).json({
      success: true, token,
      user: { email: admin.email, role: admin.role, name, picture }
    });

  } catch(e) {
    console.error('[auth/verify]', e.message);
    return res.status(500).json({ error: 'Authentication failed. Please try again.' });
  }
};
