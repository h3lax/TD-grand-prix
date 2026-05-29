import { isValidEmail } from './emailValidator';

describe('isValidEmail', () => {
  it('accepts a standard email', () => {
    expect(isValidEmail('alice@example.com')).toBe(true);
  });

  it('accepts subdomains', () => {
    expect(isValidEmail('alice@mail.example.com')).toBe(true);
  });

  it('rejects a missing @', () => {
    expect(isValidEmail('aliceexample.com')).toBe(false);
  });

  it('rejects a missing domain after @', () => {
    expect(isValidEmail('alice@')).toBe(false);
  });

  it('rejects a missing TLD', () => {
    expect(isValidEmail('alice@example')).toBe(false);
  });

  it('rejects spaces', () => {
    expect(isValidEmail('alice @example.com')).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(isValidEmail('')).toBe(false);
  });
});
