import type { VercelRequest, VercelResponse } from '@vercel/node';

interface Step2Body {
  leadId: string;
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  challenge?: string;
  style?: 'day' | 'swing' | 'longterm';
  assetClasses?: string[];
  phone?: string;
  tools?: string[];
  portfolioRange?: string;
  monthlyVolume?: string;
  region?: string;
}

/**
 * Normalize phone to E.164 format (basic implementation)
 */
function normalizePhone(phone: string): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');

  // If starts with 1 and has 11 digits, assume US/Canada
  if (digits.length === 11 && digits[0] === '1') {
    return `+${digits}`;
  }

  // If 10 digits, assume US/Canada, add +1
  if (digits.length === 10) {
    return `+1${digits}`;
  }

  // Otherwise return with + prefix if not already there
  return phone.startsWith('+') ? phone : `+${digits}`;
}

/**
 * Derive tags from profile data
 */
function deriveTags(data: Step2Body): Record<string, any> {
  const tags: Record<string, any> = {};

  if (data.experienceLevel) {
    tags[`exp:${data.experienceLevel}`] = true;
  }

  if (data.style) {
    tags[`style:${data.style}`] = true;
  }

  if (data.assetClasses && data.assetClasses.length > 0) {
    data.assetClasses.forEach(asset => {
      tags[`asset:${asset}`] = true;
    });
  }

  if (data.tools && data.tools.length > 0) {
    data.tools.forEach(tool => {
      tags[`tool:${tool}`] = true;
    });
  }

  tags['phone:present'] = !!data.phone;
  tags['phone:absent'] = !data.phone;

  if (data.portfolioRange) {
    tags[`portfolio:${data.portfolioRange}`] = true;
  }

  if (data.monthlyVolume) {
    tags[`volume:${data.monthlyVolume}`] = true;
  }

  if (data.region) {
    tags[`region:${data.region}`] = true;
  }

  return tags;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', message: 'Method not allowed' });
  }

  try {
    const body = req.body as Step2Body;

    // Validation
    if (!body.leadId) {
      return res.status(400).json({
        status: 'error',
        message: 'leadId is required'
      });
    }

    // Normalize phone if provided
    const normalizedPhone = body.phone ? normalizePhone(body.phone) : null;

    // Derive tags
    const tags = deriveTags(body);

    // Prepare profile data
    const profileData = {
      lead_id: body.leadId,
      experience_level: body.experienceLevel || null,
      challenge: body.challenge || null,
      trading_style: body.style || null,
      asset_classes: body.assetClasses || [],
      phone: normalizedPhone,
      tools: body.tools || [],
      portfolio_range: body.portfolioRange || null,
      monthly_volume: body.monthlyVolume || null,
      region: body.region || null,
      tags: tags,
      created_at: new Date().toISOString()
    };

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials');
      return res.status(500).json({
        status: 'error',
        message: 'Server configuration error'
      });
    }

    // Check if profile already exists
    const checkResponse = await fetch(
      `${supabaseUrl}/rest/v1/lead_profiles?lead_id=eq.${body.leadId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      }
    );

    const existingProfiles = await checkResponse.json();
    const profileExists = existingProfiles && existingProfiles.length > 0;

    let supabaseResponse;

    if (profileExists) {
      // PATCH (update)
      const profileId = existingProfiles[0].id;
      supabaseResponse = await fetch(
        `${supabaseUrl}/rest/v1/lead_profiles?id=eq.${profileId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            ...profileData,
            updated_at: new Date().toISOString()
          })
        }
      );
    } else {
      // POST (create)
      supabaseResponse = await fetch(`${supabaseUrl}/rest/v1/lead_profiles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(profileData)
      });
    }

    if (!supabaseResponse.ok) {
      const errorText = await supabaseResponse.text();
      console.error('Supabase error:', errorText);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to save profile'
      });
    }

    const profiles = await supabaseResponse.json();
    const profile = Array.isArray(profiles) ? profiles[0] : profiles;
    const profileId = profile?.id;

    if (!profileId) {
      console.error('No profile ID returned from Supabase');
      return res.status(500).json({
        status: 'error',
        message: 'Failed to save profile'
      });
    }

    return res.status(200).json({
      status: 'ok',
      profileId,
      tags
    });

  } catch (error: any) {
    console.error('Step 2 error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
}
