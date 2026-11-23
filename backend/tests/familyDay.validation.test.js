import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  cleanText,
  validateRegistration,
} from '../src/modules/family-day/familyDay.validation.js';

const goodForm = {
  parentName: 'Aisha Tan',
  contactEmail: 'Aisha.Tan@Example.com',
  adults: 2,
  children: 2,
  dietaryNeeds: 'Vegetarian meals requested',
  whoMayBeJoining: '',
  additionalInfo: '',
  updatesConsent: true,
};

describe('Family Day validation', () => {
  it('accepts a complete form and tidies the values', () => {
    const { errors, value } = validateRegistration(goodForm);
    assert.deepEqual(errors, {});
    assert.equal(value.contactEmail, 'aisha.tan@example.com');
    assert.equal(value.adults, 2);
    assert.equal(value.children, 2);
  });

  it('accepts counts typed as text from a form input', () => {
    const { errors, value } = validateRegistration({
      ...goodForm,
      adults: '1',
      children: '0',
    });
    assert.deepEqual(errors, {});
    assert.equal(value.adults, 1);
    assert.equal(value.children, 0);
  });

  it('requires name, email and the updates checkbox', () => {
    const { errors } = validateRegistration({ adults: 1, children: 0 });
    assert.ok(errors.parentName);
    assert.ok(errors.contactEmail);
    assert.ok(errors.updatesConsent);
  });

  it('rejects a badly formatted email', () => {
    for (const email of ['aisha', 'aisha@', '@example.com', 'a b@example.com']) {
      const { errors } = validateRegistration({ ...goodForm, contactEmail: email });
      assert.ok(errors.contactEmail, `${email} should be rejected`);
    }
  });

  it('rejects missing, negative, decimal and too-large counts', () => {
    for (const bad of [undefined, '', -1, '-1', 1.5, 'abc', 21]) {
      const { errors } = validateRegistration({ ...goodForm, adults: bad });
      assert.ok(errors.adults, `adults=${String(bad)} should be rejected`);
    }
  });

  it('needs at least one person in the household', () => {
    const { errors } = validateRegistration({ ...goodForm, adults: 0, children: 0 });
    assert.ok(errors.adults);
    assert.ok(errors.children);
  });

  it('limits the length of optional text', () => {
    const { errors } = validateRegistration({
      ...goodForm,
      dietaryNeeds: 'a'.repeat(501),
    });
    assert.ok(errors.dietaryNeeds);
  });

  it('only accepts true for the consent checkbox', () => {
    for (const bad of [false, 'true', 1, undefined]) {
      const { errors } = validateRegistration({ ...goodForm, updatesConsent: bad });
      assert.ok(errors.updatesConsent);
    }
  });
});

describe('Family Day text cleaning', () => {
  it('removes angle brackets and control characters', () => {
    assert.equal(cleanText('<script>alert(1)</script>Tan\u0000'), 'scriptalert(1)/scriptTan');
  });

  it('collapses extra spaces on one-line fields', () => {
    assert.equal(cleanText('  Aisha    Tan  '), 'Aisha Tan');
  });

  it('keeps line breaks on multi-line fields', () => {
    assert.equal(cleanText('Line 1\r\n\r\n\r\n\r\nLine 2', { multiline: true }), 'Line 1\n\nLine 2');
  });
});
