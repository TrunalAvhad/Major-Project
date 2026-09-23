import test from 'node:test';
import assert from 'node:assert/strict';
import { authService, ROLES } from '../services/authService.js';

test('Module 1 Integration: ROLES.HOSPITAL_OPERATOR contract', () => {
  assert.equal(ROLES.HOSPITAL_OPERATOR, 'hospital_operator');
  assert.equal(ROLES.RESEARCHER, 'researcher');
  assert.equal(ROLES.ADMIN, 'admin');
});

test('Module 1 Integration: Hospital Operator login success with valid credentials', async () => {
  const user = await authService.login('operator@stjude-clinical.org', 'hospital123');
  assert.ok(user);
  assert.equal(user.role, ROLES.HOSPITAL_OPERATOR);
  assert.equal(user.hospital_id, 'HOSP_000001');
  assert.equal(authService.isAuthenticated(), true);
  assert.equal(authService.getHospitalId(), 'HOSP_000001');
});

test('Module 1 Integration: Hospital Isolation enforces rejection of Researcher role', async () => {
  await assert.rejects(
    async () => {
      await authService.login('researcher@consortium.org', 'anypassword');
    },
    (err) => {
      assert.match(err.message, /HOSPITAL_ACCESS_DENIED/);
      return true;
    }
  );
});

test('Module 1 Integration: Rejects invalid credentials', async () => {
  await assert.rejects(
    async () => {
      await authService.login('operator@stjude-clinical.org', 'wrongpassword');
    },
    (err) => {
      assert.match(err.message, /INVALID_CREDENTIALS/);
      return true;
    }
  );
});

test('Module 1 Integration: Logout clears session and hospital isolation context', async () => {
  await authService.logout();
  assert.equal(authService.isAuthenticated(), false);
  assert.equal(authService.getCurrentUser(), null);
  assert.equal(authService.getHospitalId(), null);
});
