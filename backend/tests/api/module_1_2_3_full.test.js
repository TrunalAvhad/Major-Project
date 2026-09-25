const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = require('../../src/app');
const User = require('../../src/authentication/models/User');
const Hospital = require('../../src/authentication/models/Hospital');
const AuditLog = require('../../src/authentication/models/AuditLog');
const TrainingRequest = require('../../src/models/TrainingRequest');
const StoredModel = require('../../src/models/StoredModel');
const { ROLES } = require('../../src/authentication/permissions/roles');

let mongoServer;
let adminToken;
let approvedResearcherToken;
let pendingResearcherToken;
let hospitalToken;
let adminUser;
let approvedResearcherUser;
let pendingResearcherUser;
let hospitalUser;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();
  process.env.JWT_SECRET = 'test-secret-for-modules-1-2-3';
  process.env.JWT_EXPIRES_IN = '1h';
  process.env.MAX_FAILED_LOGIN_ATTEMPTS = '5';
  process.env.NODE_ENV = 'test';

  await mongoose.connect(process.env.MONGODB_URI);
}, 180000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  await User.deleteMany({});
  await Hospital.deleteMany({});
  await AuditLog.deleteMany({});
  await TrainingRequest.deleteMany({});
  await StoredModel.deleteMany({});

  // Seed default hospital node
  await Hospital.create({
    hospital_id: 'HOSP_000001',
    name: 'St. Jude Clinical Research & AI Node',
    status: 'active',
    client_ids: ['client_001']
  });

  // Seed second hospital node
  await Hospital.create({
    hospital_id: 'HOSP_000002',
    name: 'Charité Berlin AI Node',
    status: 'active',
    client_ids: ['client_002']
  });

  // Seed Admin
  adminUser = await User.create({
    user_id: 'USR_admin_001',
    account_id: 'ADM-001',
    name: 'Consortium Admin',
    email: 'admin@consortium.org',
    password_hash: 'admin123',
    role: ROLES.ADMIN,
    status: 'active'
  });

  // Seed Approved Researcher
  approvedResearcherUser = await User.create({
    user_id: 'USR_res_approved',
    account_id: 'RES-001',
    name: 'Dr. Elena Rostova',
    email: 'e.rostova@med.stanford.edu',
    password_hash: 'researcher123',
    role: ROLES.RESEARCHER,
    status: 'active'
  });

  // Seed Pending Researcher
  pendingResearcherUser = await User.create({
    user_id: 'USR_res_pending',
    account_id: 'RES-002',
    name: 'Dr. Arthur Pendelton',
    email: 'pending@med.harvard.edu',
    password_hash: 'researcher123',
    role: ROLES.RESEARCHER,
    status: 'pending'
  });

  // Seed Hospital Operator
  hospitalUser = await User.create({
    user_id: 'USR_hosp_operator',
    account_id: 'HOS-001',
    name: 'Dr. Marcus Vance',
    email: 'operator@stjude-clinical.org',
    password_hash: 'hospital123',
    role: ROLES.HOSPITAL_OPERATOR,
    hospital_id: 'HOSP_000001',
    status: 'active'
  });

  // Get Admin token
  const adminLogin = await request(app).post('/api/v1/auth/login').send({
    email: 'admin@consortium.org',
    password: 'admin123'
  });
  adminToken = adminLogin.body.data.access_token;

  // Get Approved Researcher token
  const resLogin = await request(app).post('/api/v1/auth/login').send({
    email: 'e.rostova@med.stanford.edu',
    password: 'researcher123'
  });
  approvedResearcherToken = resLogin.body.data.access_token;

  // Get Hospital token
  const hospLogin = await request(app).post('/api/v1/auth/login').send({
    email: 'operator@stjude-clinical.org',
    password: 'hospital123'
  });
  hospitalToken = hospLogin.body.data.access_token;
});

describe('Modules 1, 2, 3 - Comprehensive Specification Test Suite', () => {

  // ============================================================================
  // AUTHENTICATION & EMAIL TESTS (1 - 17)
  // ============================================================================
  describe('Email Provider & Registration Rules', () => {
    it('1. should accept Gmail registration', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Gmail Researcher',
        email: 'clinician.test@gmail.com',
        password: 'Password123!',
        role: ROLES.RESEARCHER
      });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('clinician.test@gmail.com');
    });

    it('2. should accept Outlook registration', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Outlook Researcher',
        email: 'radiologist@outlook.com',
        password: 'Password123!',
        role: ROLES.RESEARCHER
      });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('radiologist@outlook.com');
    });

    it('3. should accept Yahoo registration', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Yahoo Researcher',
        email: 'medical_fellow@yahoo.com',
        password: 'Password123!',
        role: ROLES.RESEARCHER
      });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('medical_fellow@yahoo.com');
    });

    it('4. should accept Institutional email registration (.edu / .org / .health)', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Institutional Researcher',
        email: 'investigator@stanford.edu',
        password: 'Password123!',
        role: ROLES.RESEARCHER
      });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('investigator@stanford.edu');
    });

    it('5. should reject invalid email formats', async () => {
      const invalidEmails = ['plainaddress', '@missingusername.com', 'user@.com', 'user@domain..com'];
      for (const email of invalidEmails) {
        const res = await request(app).post('/api/v1/auth/register').send({
          name: 'Invalid Email User',
          email,
          password: 'Password123!',
          role: ROLES.RESEARCHER
        });
        expect(res.status).toBe(400);
        expect(res.body.error.code).toBe('VALIDATION_ERROR');
      }
    });

    it('6. should register researcher with status pending and account_id starting with RES-', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'New Researcher',
        email: 'new.researcher@jhmi.edu',
        password: 'Password123!',
        role: ROLES.RESEARCHER
      });
      expect(res.status).toBe(201);
      expect(res.body.data.user.status).toBe('pending');
      expect(res.body.data.user.account_id).toMatch(/^RES-/);
      expect(res.body.data.user.user_id).toMatch(/^USR_/);
    });

    it('7. should register hospital operator with assigned hospital_id and account_id starting with HOS-', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Berlin Operator',
        email: 'operator@charite-berlin.de',
        password: 'Password123!',
        role: ROLES.HOSPITAL_OPERATOR,
        hospital_id: 'HOSP_000002'
      });
      expect(res.status).toBe(201);
      expect(res.body.data.user.role).toBe(ROLES.HOSPITAL_OPERATOR);
      expect(res.body.data.user.hospital_id).toBe('HOSP_000002');
      expect(res.body.data.user.account_id).toMatch(/^HOS-/);
    });

    it('8. should reject duplicate researcher registration under the same email', async () => {
      await request(app).post('/api/v1/auth/register').send({
        name: 'Researcher X',
        email: 'person@example.com',
        password: 'Password123!',
        role: ROLES.RESEARCHER
      });

      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Researcher X Duplicate',
        email: 'person@example.com',
        password: 'Password123!',
        role: ROLES.RESEARCHER
      });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
    });

    it('9. should reject duplicate hospital registration under the same email', async () => {
      await request(app).post('/api/v1/auth/register').send({
        name: 'Hospital Operator 1',
        email: 'hosp.person@example.com',
        password: 'Password123!',
        role: ROLES.HOSPITAL_OPERATOR,
        hospital_id: 'HOSP_000001'
      });

      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Hospital Operator 2',
        email: 'hosp.person@example.com',
        password: 'Password123!',
        role: ROLES.HOSPITAL_OPERATOR,
        hospital_id: 'HOSP_000002'
      });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
    });

    it('10. should allow SAME EMAIL to register separately as Researcher and Hospital Operator', async () => {
      const email = 'multi.role.user@consortium.org';

      // Register as Researcher
      const resResearcher = await request(app).post('/api/v1/auth/register').send({
        name: 'Multi Role Person',
        email,
        password: 'ResearcherPass123!',
        role: ROLES.RESEARCHER
      });
      expect(resResearcher.status).toBe(201);
      const researcherId = resResearcher.body.data.user.user_id;
      const resAccountId = resResearcher.body.data.user.account_id;

      // Register as Hospital Operator with the SAME EMAIL
      const resHospital = await request(app).post('/api/v1/auth/register').send({
        name: 'Multi Role Person',
        email,
        password: 'HospitalPass123!',
        role: ROLES.HOSPITAL_OPERATOR,
        hospital_id: 'HOSP_000001'
      });
      expect(resHospital.status).toBe(201);
      const hospitalUserId = resHospital.body.data.user.user_id;
      const hosAccountId = resHospital.body.data.user.account_id;

      // Verify two separate accounts with distinct IDs were generated
      expect(researcherId).not.toBe(hospitalUserId);
      expect(resAccountId).not.toBe(hosAccountId);
      expect(resAccountId).toMatch(/^RES-/);
      expect(hosAccountId).toMatch(/^HOS-/);
    });

    it('11. researcher login with valid credentials should succeed', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'e.rostova@med.stanford.edu',
        password: 'researcher123',
        role: ROLES.RESEARCHER
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe(ROLES.RESEARCHER);
      expect(res.body.data.access_token).toBeDefined();
    });

    it('12. hospital login with valid credentials should succeed', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'operator@stjude-clinical.org',
        password: 'hospital123',
        role: ROLES.HOSPITAL_OPERATOR
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe(ROLES.HOSPITAL_OPERATOR);
      expect(res.body.data.user.hospital_id).toBe('HOSP_000001');
    });

    it('13. same email login with correct role should authenticate intended account', async () => {
      const email = 'doctor.dual@med.edu';

      // Create Researcher (make active)
      await User.create({
        user_id: 'USR_dual_res',
        account_id: 'RES-DUAL',
        name: 'Dual Doctor',
        email,
        password_hash: 'PasswordRes!',
        role: ROLES.RESEARCHER,
        status: 'active'
      });

      // Create Hospital Operator
      await User.create({
        user_id: 'USR_dual_hosp',
        account_id: 'HOS-DUAL',
        name: 'Dual Doctor',
        email,
        password_hash: 'PasswordHosp!',
        role: ROLES.HOSPITAL_OPERATOR,
        hospital_id: 'HOSP_000001',
        status: 'active'
      });

      // Login targeting researcher
      const resLogin = await request(app).post('/api/v1/auth/login').send({
        email,
        password: 'PasswordRes!',
        role: ROLES.RESEARCHER
      });
      expect(resLogin.status).toBe(200);
      expect(resLogin.body.data.user.account_id).toBe('RES-DUAL');
      expect(resLogin.body.data.user.role).toBe(ROLES.RESEARCHER);

      // Login targeting hospital operator
      const hospLogin = await request(app).post('/api/v1/auth/login').send({
        email,
        password: 'PasswordHosp!',
        role: ROLES.HOSPITAL_OPERATOR
      });
      expect(hospLogin.status).toBe(200);
      expect(hospLogin.body.data.user.account_id).toBe('HOS-DUAL');
      expect(hospLogin.body.data.user.role).toBe(ROLES.HOSPITAL_OPERATOR);
    });

    it('14. same email login with wrong role selection should be rejected', async () => {
      const email = 'only.res@example.com';
      await User.create({
        user_id: 'USR_only_res',
        account_id: 'RES-ONLY',
        name: 'Only Researcher',
        email,
        password_hash: 'SecretPass123',
        role: ROLES.RESEARCHER,
        status: 'active'
      });

      // Attempting to login to hospital_operator when only researcher exists
      const res = await request(app).post('/api/v1/auth/login').send({
        email,
        password: 'SecretPass123',
        role: ROLES.HOSPITAL_OPERATOR
      });
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('15. wrong password should be rejected with 401 INVALID_CREDENTIALS', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'e.rostova@med.stanford.edu',
        password: 'WrongPassword!',
        role: ROLES.RESEARCHER
      });
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('16. correct password should be accepted with 200 OK', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'e.rostova@med.stanford.edu',
        password: 'researcher123',
        role: ROLES.RESEARCHER
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('17. password hash should never be exposed in normal API responses', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'e.rostova@med.stanford.edu',
        password: 'researcher123'
      });
      expect(res.status).toBe(200);
      expect(res.body.data.user.password_hash).toBeUndefined();
      expect(res.body.data.user.password).toBeUndefined();

      const meRes = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${adminToken}`);
      expect(meRes.body.data.user.password_hash).toBeUndefined();
    });
  });

  // ============================================================================
  // RESEARCHER APPROVAL WORKFLOW (18 - 24)
  // ============================================================================
  describe('Researcher Approval Workflow', () => {
    it('18. newly registered researcher starts with status pending', async () => {
      const user = await User.findOne({ email: 'pending@med.harvard.edu' });
      expect(user.status).toBe('pending');
    });

    it('19. pending researcher cannot access protected researcher features', async () => {
      // Login attempt by pending user returns 403 ACCOUNT_PENDING
      const loginRes = await request(app).post('/api/v1/auth/login').send({
        email: 'pending@med.harvard.edu',
        password: 'researcher123'
      });
      expect(loginRes.status).toBe(403);
      expect(loginRes.body.error.code).toBe('ACCOUNT_PENDING');
    });

    it('20. admin can view pending researchers', async () => {
      const res = await request(app)
        .get('/api/v1/admin/researchers/pending')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.researchers)).toBe(true);
      const pendingArthur = res.body.data.researchers.find(r => r.email === 'pending@med.harvard.edu');
      expect(pendingArthur).toBeDefined();
      expect(pendingArthur.status).toBe('pending');
    });

    it('21. admin can approve pending researcher', async () => {
      const res = await request(app)
        .post(`/api/v1/admin/users/${pendingResearcherUser.user_id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.status).toBe('active');

      const updated = await User.findOne({ user_id: pendingResearcherUser.user_id });
      expect(updated.status).toBe('active');
    });

    it('22. approved researcher can log in and access protected features', async () => {
      // Approve researcher
      await request(app)
        .post(`/api/v1/admin/users/${pendingResearcherUser.user_id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);

      // Login now succeeds
      const loginRes = await request(app).post('/api/v1/auth/login').send({
        email: 'pending@med.harvard.edu',
        password: 'researcher123'
      });
      expect(loginRes.status).toBe(200);
      const newToken = loginRes.body.data.access_token;

      // Access protected researcher feature: create training request
      const createReq = await request(app)
        .post('/api/v1/training-requests')
        .set('Authorization', `Bearer ${newToken}`)
        .send({
          disease: 'COVID-19',
          task: 'Image Classification',
          description: 'Bilateral opacity detection'
        });
      expect(createReq.status).toBe(201);
    });

    it('23. hospital operator cannot approve researcher (403 FORBIDDEN)', async () => {
      const res = await request(app)
        .post(`/api/v1/admin/users/${pendingResearcherUser.user_id}/approve`)
        .set('Authorization', `Bearer ${hospitalToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('24. researcher cannot approve themselves or other researchers (403 FORBIDDEN)', async () => {
      const res = await request(app)
        .post(`/api/v1/admin/users/${pendingResearcherUser.user_id}/approve`)
        .set('Authorization', `Bearer ${approvedResearcherToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });
  });

  // ============================================================================
  // TRAINING REQUEST & HOSPITAL PARTICIPATION (25 - 32)
  // ============================================================================
  describe('Training Request & Hospital Participation Workflow', () => {
    let testRequestId;

    it('25. researcher creates a training request (metadata only)', async () => {
      const res = await request(app)
        .post('/api/v1/training-requests')
        .set('Authorization', `Bearer ${approvedResearcherToken}`)
        .send({
          disease: 'Malaria',
          task: 'Image Classification',
          description: 'Thin smear blood cell stage classification',
          model_architecture: 'ResNet-18',
          training_config: { target_epochs: 10, batch_size: 16 }
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.training_request.request_id).toMatch(/^REQ_/);
      expect(res.body.data.training_request.disease).toBe('Malaria');
      expect(res.body.data.training_request.status).toBe('OPEN');
      testRequestId = res.body.data.training_request.request_id;
    });

    it('26. request appears in available requests list', async () => {
      await request(app)
        .post('/api/v1/training-requests')
        .set('Authorization', `Bearer ${approvedResearcherToken}`)
        .send({
          disease: 'Malaria',
          task: 'Image Classification'
        });

      const res = await request(app)
        .get('/api/v1/training-requests')
        .set('Authorization', `Bearer ${approvedResearcherToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.training_requests.length).toBeGreaterThan(0);
      expect(res.body.data.training_requests[0].disease).toBe('Malaria');
    });

    it('27. hospital operator can view available training requests', async () => {
      const reqDoc = await TrainingRequest.create({
        request_id: 'REQ_malaria_view',
        researcher_id: approvedResearcherUser.user_id,
        researcher_name: approvedResearcherUser.name,
        disease: 'Malaria',
        task: 'Image Classification',
        status: 'OPEN'
      });

      const res = await request(app)
        .get(`/api/v1/training-requests/${reqDoc.request_id}`)
        .set('Authorization', `Bearer ${hospitalToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.training_request.disease).toBe('Malaria');
    });

    it('28. hospital operator participates in a training request', async () => {
      const reqDoc = await TrainingRequest.create({
        request_id: 'REQ_participate_01',
        researcher_id: approvedResearcherUser.user_id,
        researcher_name: approvedResearcherUser.name,
        disease: 'Malaria',
        task: 'Image Classification',
        status: 'OPEN'
      });

      const res = await request(app)
        .post(`/api/v1/training-requests/${reqDoc.request_id}/participate`)
        .set('Authorization', `Bearer ${hospitalToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.participation.status).toBe('ACCEPTED');
      expect(res.body.data.participation.hospital_id).toBe('HOSP_000001');
    });

    it('29. hospital participation is recorded and request status updates to ACTIVE', async () => {
      const reqDoc = await TrainingRequest.create({
        request_id: 'REQ_participate_02',
        researcher_id: approvedResearcherUser.user_id,
        researcher_name: approvedResearcherUser.name,
        disease: 'Pneumonia',
        task: 'Image Classification',
        status: 'OPEN'
      });

      await request(app)
        .post(`/api/v1/training-requests/${reqDoc.request_id}/participate`)
        .set('Authorization', `Bearer ${hospitalToken}`);

      const updated = await TrainingRequest.findOne({ request_id: reqDoc.request_id });
      expect(updated.status).toBe('ACTIVE');
      expect(updated.participating_hospitals.length).toBe(1);
      expect(updated.participating_hospitals[0].hospital_id).toBe('HOSP_000001');
      expect(updated.participating_hospitals[0].status).toBe('ACCEPTED');
    });

    it('30. hospital operator can withdraw from participation with a reason', async () => {
      const reqDoc = await TrainingRequest.create({
        request_id: 'REQ_withdraw_01',
        researcher_id: approvedResearcherUser.user_id,
        researcher_name: approvedResearcherUser.name,
        disease: 'Malaria',
        task: 'Image Classification',
        status: 'ACTIVE',
        participating_hospitals: [{
          hospital_id: 'HOSP_000001',
          hospital_name: 'St. Jude Clinical Research & AI Node',
          status: 'ACCEPTED',
          joined_at: new Date()
        }]
      });

      const res = await request(app)
        .post(`/api/v1/training-requests/${reqDoc.request_id}/withdraw`)
        .set('Authorization', `Bearer ${hospitalToken}`)
        .send({ reason: 'GPU maintenance required on local workstation' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.participation.status).toBe('WITHDRAWN');
      expect(res.body.data.participation.withdrawal_reason).toBe('GPU maintenance required on local workstation');
    });

    it('31. withdrawal is recorded with timestamp and reason', async () => {
      const reqDoc = await TrainingRequest.create({
        request_id: 'REQ_withdraw_02',
        researcher_id: approvedResearcherUser.user_id,
        researcher_name: approvedResearcherUser.name,
        disease: 'Malaria',
        status: 'ACTIVE',
        participating_hospitals: [{
          hospital_id: 'HOSP_000001',
          status: 'ACCEPTED',
          joined_at: new Date()
        }]
      });

      await request(app)
        .post(`/api/v1/training-requests/${reqDoc.request_id}/withdraw`)
        .set('Authorization', `Bearer ${hospitalToken}`)
        .send({ reason: 'Local cluster scheduled offline' });

      const updated = await TrainingRequest.findOne({ request_id: reqDoc.request_id });
      const record = updated.participating_hospitals.find(h => h.hospital_id === 'HOSP_000001');
      expect(record.status).toBe('WITHDRAWN');
      expect(record.withdrawn_at).not.toBeNull();
      expect(record.withdrawal_reason).toBe('Local cluster scheduled offline');
    });

    it('32. historical participation record remains after withdrawal (not deleted)', async () => {
      const reqDoc = await TrainingRequest.create({
        request_id: 'REQ_withdraw_history',
        researcher_id: approvedResearcherUser.user_id,
        researcher_name: approvedResearcherUser.name,
        disease: 'Malaria',
        status: 'ACTIVE',
        participating_hospitals: [{
          hospital_id: 'HOSP_000001',
          hospital_name: 'St. Jude Node',
          status: 'ACCEPTED',
          joined_at: new Date(Date.now() - 100000)
        }]
      });

      await request(app)
        .post(`/api/v1/training-requests/${reqDoc.request_id}/withdraw`)
        .set('Authorization', `Bearer ${hospitalToken}`)
        .send({ reason: 'Completed trial phase' });

      const checkDoc = await TrainingRequest.findOne({ request_id: reqDoc.request_id });
      expect(checkDoc.participating_hospitals.length).toBe(1);
      expect(checkDoc.participating_hospitals[0].hospital_id).toBe('HOSP_000001');
      expect(checkDoc.participating_hospitals[0].joined_at).toBeDefined();
    });
  });

  // ============================================================================
  // ADMIN DASHBOARD, REPORTING & TELEMETRY (33 - 39)
  // ============================================================================
  describe('Admin Dashboard, Reporting and Telemetry', () => {
    beforeEach(async () => {
      // Seed Training Requests and Stored Models for Admin tests
      await TrainingRequest.create({
        request_id: 'REQ_malaria_admin',
        researcher_id: approvedResearcherUser.user_id,
        researcher_name: approvedResearcherUser.name,
        disease: 'Malaria',
        task: 'Image Classification',
        status: 'ACTIVE',
        model_version: 'v1',
        participating_hospitals: [
          {
            hospital_id: 'HOSP_000001',
            hospital_name: 'St. Jude Node',
            status: 'ACCEPTED',
            joined_at: new Date(),
            training_metrics: {
              current_epoch: null,
              total_epochs: null,
              loss: null,
              accuracy: null,
              status: 'Waiting for training session'
            }
          }
        ]
      });

      await StoredModel.create({
        model_id: 'MOD_malaria_v1',
        request_id: 'REQ_malaria_admin',
        disease: 'Malaria',
        task: 'Image Classification',
        architecture: 'ResNet-18',
        version: 'v1',
        status: 'APPROVED',
        sha256: 'abc123sha256'
      });

      await StoredModel.create({
        model_id: 'MOD_malaria_v2',
        request_id: 'REQ_malaria_admin',
        disease: 'Malaria',
        task: 'Image Classification',
        architecture: 'EfficientNet-B0',
        version: 'v2',
        status: 'APPROVED',
        sha256: 'def456sha256'
      });
    });

    it('33. admin gets dynamic disease/model list', async () => {
      const res = await request(app)
        .get('/api/v1/admin/diseases')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.diseases)).toBe(true);
      expect(res.body.data.diseases).toContain('Malaria');
    });

    it('34. selected disease filtering returns relevant requests and models', async () => {
      const res = await request(app)
        .get('/api/v1/admin/reports?disease=Malaria')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.disease).toBe('Malaria');
      expect(res.body.data.reports.length).toBeGreaterThan(0);
      expect(res.body.data.reports[0].disease).toBe('Malaria');
    });

    it('35. hospital participation report displays participating hospitals without inventing data', async () => {
      const res = await request(app)
        .get('/api/v1/admin/reports?disease=Malaria')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      const hospitals = res.body.data.reports[0].participating_hospitals;
      expect(hospitals.length).toBe(1);
      expect(hospitals[0].hospital_id).toBe('HOSP_000001');
      expect(hospitals[0].training_metrics.loss).toBe('Not available');
    });

    it('36. training status shows actual status or "No training data available"', async () => {
      const res = await request(app)
        .get('/api/v1/admin/reports?disease=Malaria')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      const report = res.body.data.reports[0];
      expect(report.status).toBe('ACTIVE');
      expect(report.participating_hospitals[0].training_metrics.status).toBe('No training data available');
    });

    it('37. model versions are explicitly displayed (v1, v2)', async () => {
      const res = await request(app)
        .get('/api/v1/admin/stored-models?disease=Malaria')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      const versions = res.body.data.models.map(m => m.version);
      expect(versions).toContain('v1');
      expect(versions).toContain('v2');
    });

    it('38. telemetry endpoint displays actual node states without fake random numbers', async () => {
      const res = await request(app)
        .get('/api/v1/admin/telemetry')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.hospital_nodes.length).toBeGreaterThan(0);
      expect(res.body.data.hospital_nodes[0].telemetry_state).toBe('NOT AVAILABLE');
      expect(res.body.data.hospital_nodes[0].vram_usage).toBe('Not available');
    });

    it('39. stored model metadata references are preserved without large binaries in database', async () => {
      const res = await request(app)
        .get('/api/v1/admin/stored-models')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.models.length).toBeGreaterThan(0);
      const model = res.body.data.models[0];
      expect(model.model_id).toBeDefined();
      expect(model.architecture).toBeDefined();
      expect(model.sha256).toBeDefined();
    });
  });

  // ============================================================================
  // AUTHORIZATION & PRIVACY BOUNDARIES (40 - 46)
  // ============================================================================
  describe('Authorization & Privacy Enforcement', () => {
    it('40. hospital operator cannot access admin endpoints', async () => {
      const res = await request(app)
        .get('/api/v1/admin/researchers')
        .set('Authorization', `Bearer ${hospitalToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('41. researcher cannot access admin endpoints', async () => {
      const res = await request(app)
        .get('/api/v1/admin/researchers')
        .set('Authorization', `Bearer ${approvedResearcherToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('42. unauthorized user cannot participate or withdraw on behalf of another hospital', async () => {
      const reqDoc = await TrainingRequest.create({
        request_id: 'REQ_auth_test',
        researcher_id: approvedResearcherUser.user_id,
        researcher_name: approvedResearcherUser.name,
        disease: 'Malaria',
        status: 'ACTIVE'
      });

      // Researcher role trying to participate as a hospital
      const res = await request(app)
        .post(`/api/v1/training-requests/${reqDoc.request_id}/participate`)
        .set('Authorization', `Bearer ${approvedResearcherToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('43. hospital operator cannot see or modify another hospital private state', async () => {
      const res = await request(app)
        .get('/api/v1/auth/hospitals/HOSP_000002/clients')
        .set('Authorization', `Bearer ${hospitalToken}`);

      // Hospital operator assigned to HOSP_000001 cannot query HOSP_000002
      expect([403, 404]).toContain(res.status);
    });

    it('44. training request rejects payloads containing raw medical images (Zero-Raw-Data Invariant)', async () => {
      const res = await request(app)
        .post('/api/v1/training-requests')
        .set('Authorization', `Bearer ${approvedResearcherToken}`)
        .send({
          disease: 'Malaria',
          task: 'Image Classification',
          raw_images: ['data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...']
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('PRIVACY_VIOLATION');
    });

    it('45. telemetry response never contains patient PHI or medical records', async () => {
      const res = await request(app)
        .get('/api/v1/admin/telemetry')
        .set('Authorization', `Bearer ${adminToken}`);

      const jsonStr = JSON.stringify(res.body);
      expect(jsonStr).not.toContain('patient');
      expect(jsonStr).not.toContain('mrn');
      expect(jsonStr).not.toContain('phi');
    });

    it('46. audit logs strip passwords and sensitive metadata', async () => {
      await request(app).post('/api/v1/auth/login').send({
        email: 'e.rostova@med.stanford.edu',
        password: 'WrongPasswordAttempt'
      });

      const logs = await AuditLog.find({ action: 'LOGIN_FAILED' });
      expect(logs.length).toBeGreaterThan(0);
      const latestLog = logs[logs.length - 1];
      const logStr = JSON.stringify(latestLog);
      expect(logStr).not.toContain('WrongPasswordAttempt');
    });
  });

});
