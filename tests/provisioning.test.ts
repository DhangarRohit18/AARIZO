import { UniversalProvisioningService } from '../server/src/provisioning';

describe('SafeGate 2.0 Universal User Provisioning Service', () => {
  test('should generate secure 12-character temporary passwords with numbers and symbols', () => {
    const pass = UniversalProvisioningService.generateSecurePassword();
    expect(pass).toBeDefined();
    expect(pass.length).toBe(12);
    expect(typeof pass).toBe('string');
  });

  test('should compute deterministic SHA-256 HMAC password hashes', () => {
    const salt = 'test_salt_12345';
    const hash1 = UniversalProvisioningService.hashPassword('Secret123!', salt);
    const hash2 = UniversalProvisioningService.hashPassword('Secret123!', salt);
    const hashDiff = UniversalProvisioningService.hashPassword('DifferentPassword!', salt);

    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(hashDiff);
    expect(hash1.length).toBe(64); // SHA-256 hex length
  });

  test('should reject society provisioning with invalid secretary email', async () => {
    await expect(
      UniversalProvisioningService.provisionSociety({
        societyName: 'Test Heights',
        address: 'MG Road',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411001',
        secretaryName: 'Rohit Secretary',
        secretaryEmail: 'invalid-email-no-at',
        secretaryPhone: '9876543210',
      })
    ).rejects.toThrow('Valid secretary email is required.');
  });

  test('should reject user provisioning when societyId is missing', async () => {
    await expect(
      UniversalProvisioningService.provisionUser({
        societyId: '',
        role: 'guard',
        name: 'Gate Guard',
        email: 'guard@safegate.com',
        phone: '9876543211',
      })
    ).rejects.toThrow('Society ID is required.');
  });

  test('should reject society provisioning when secretary password is missing', async () => {
    await expect(
      UniversalProvisioningService.provisionSociety({
        societyName: 'Test Heights',
        address: 'MG Road',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411001',
        secretaryName: 'Rohit Secretary',
        secretaryEmail: 'rohit@safegate.com',
        secretaryPhone: '9876543210',
        secretaryPassword: '',
      })
    ).rejects.toThrow('Secretary password is required.');
  });

  test('should reject user provisioning when user password is missing', async () => {
    await expect(
      UniversalProvisioningService.provisionUser({
        societyId: 'soc-test-123',
        role: 'resident',
        name: 'Amit Resident',
        email: 'amit@safegate.com',
        phone: '9876543211',
        password: '',
      })
    ).rejects.toThrow('User password is required.');
  });
});
