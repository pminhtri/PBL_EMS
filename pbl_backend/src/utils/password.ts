import * as argon from 'argon2';
import { randomBytes } from 'crypto';

export function hashPassword(password: string): Promise<string> {
  const generateSalt = randomBytes(16);
  const hashedPassword = argon.hash(password, {
    salt: generateSalt,
    saltLength: 16,
  });

  return hashedPassword;
}

export function autoGeneratedPassword(): string {
  return Math.random().toString(36).slice(-8);
}

export function verifyPassword(
  hashedPassword: string,
  password: string,
): Promise<boolean> {
  return argon.verify(hashedPassword, password);
}
