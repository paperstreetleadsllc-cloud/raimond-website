/**
 * Vercel Serverless Function for non-Next.js projects (Vite SPA).
 * File path: /api/subscribe.ts
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method Not Allowed' });
    return;
  }
  try {
    const { name, email } = req.body || {};
    if (!email) {
      res.status(400).json({ success: false, error: 'Email required' });
      return;
    }
    console.log('🟢 New beta signup:', name || '(no name)', email);

    // TODO: plug into your real storage (Airtable/Notion/Supabase/etc.)
    res.status(200).json({
      success: true,
      message: `Thanks ${name || 'trader'}! You’re on the RAImond beta waitlist.`,
    });
  } catch (e) {
    console.error('Subscribe error:', e);
    res.status(500).json({ success: false, error: 'Server error' });
  }
}