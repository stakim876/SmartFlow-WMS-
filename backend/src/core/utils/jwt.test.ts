import { describe, expect, it } from 'vitest';
import {
  getRefreshTokenExpiry,
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from './jwt';

describe('jwt utils', () => {
  it('signAccessToken returns a JWT string', () => {
    const token = signAccessToken({
      userId: 'user-1',
      roleId: 'role-1',
      roleName: 'ADMIN',
    });

    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);
  });

  it('signRefreshToken can be verified', () => {
    const token = signRefreshToken('user-1');
    expect(verifyRefreshToken(token).userId).toBe('user-1');
  });

  it('hashToken is deterministic', () => {
    expect(hashToken('abc')).toBe(hashToken('abc'));
    expect(hashToken('abc')).not.toBe(hashToken('xyz'));
  });

  it('getRefreshTokenExpiry adds days from JWT_REFRESH_EXPIRES_IN', () => {
    const before = Date.now();
    const expiry = getRefreshTokenExpiry();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

    expect(expiry.getTime()).toBeGreaterThanOrEqual(before + sevenDaysMs - 1000);
    expect(expiry.getTime()).toBeLessThanOrEqual(before + sevenDaysMs + 1000);
  });
});
