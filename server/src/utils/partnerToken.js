import jwt from 'jsonwebtoken';

const PARTNER_TOKEN_EXPIRY = '7d';

function getJwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined.');
  }

  return process.env.JWT_SECRET;
}

export function createPartnerToken(partner) {
  return jwt.sign(
    {
      sub: String(partner._id),
      email: partner.officialEmail,
      role: partner.role
    },
    getJwtSecret(),
    {
      expiresIn: PARTNER_TOKEN_EXPIRY
    }
  );
}

export function extractBearerToken(authorizationHeader = '') {
  if (!authorizationHeader.startsWith('Bearer ')) {
    return '';
  }

  return authorizationHeader.slice('Bearer '.length).trim();
}

export function verifyPartnerToken(token) {
  try {
    return jwt.verify(token, getJwtSecret());
  } catch (_error) {
    return null;
  }
}
