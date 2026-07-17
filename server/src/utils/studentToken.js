import jwt from 'jsonwebtoken';

const STUDENT_TOKEN_EXPIRY = '7d';

function getJwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined.');
  }

  return process.env.JWT_SECRET;
}

export function createStudentToken(user) {
  return jwt.sign(
    {
      sub: String(user._id),
      email: user.email,
      role: 'student'
    },
    getJwtSecret(),
    {
      expiresIn: STUDENT_TOKEN_EXPIRY
    }
  );
}

export function extractBearerToken(authorizationHeader = '') {
  if (!authorizationHeader.startsWith('Bearer ')) {
    return '';
  }

  return authorizationHeader.slice('Bearer '.length).trim();
}

export function verifyStudentToken(token) {
  try {
    return jwt.verify(token, getJwtSecret());
  } catch (_error) {
    return null;
  }
}
