const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = require('../../src/app');

const User = require('../../src/authentication/models/User');
const Hospital = require('../../src/authentication/models/Hospital');
const AuditLog = require('../../src/authentication/models/AuditLog');

const AuditService =
  require('../../src/authentication/services/auditService');

const { ROLES } =
  require('../../src/authentication/permissions/roles');

const {
  requireAuth,
} = require('../../src/authentication/middleware/authMiddleware');

const {
  requireHospitalAccess,
} = require('../../src/authentication/middleware/hospitalMiddleware');

let mongoServer;


/*
|--------------------------------------------------------------------------
| TEST DATABASE SETUP
|--------------------------------------------------------------------------
*/

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();

  process.env.MONGODB_URI = mongoServer.getUri();
  process.env.JWT_SECRET = 'test-secret-for-module-1';
  process.env.JWT_EXPIRES_IN = '1h';
  process.env.MAX_FAILED_LOGIN_ATTEMPTS = '3';
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
});


/*
|--------------------------------------------------------------------------
| HELPER FUNCTIONS
|--------------------------------------------------------------------------
*/

async function createActiveUser({
  user_id = `USR_${Math.random()
    .toString(16)
    .slice(2, 14)}`,

  name = 'Test User',

  email = `user_${Date.now()}@example.com`,

  password = 'Password123!',

  role = ROLES.RESEARCHER,

  hospital_id = null,
} = {}) {

  const user = await User.create({
    user_id,
    name,
    email,
    password_hash: password,
    role,
    hospital_id,
    status: 'active',
  });

  return user;
}


async function login(
  email,
  password = 'Password123!'
) {

  return await request(app)
    .post('/api/v1/auth/login')
    .send({
      email,
      password,
    });
}


/*
|--------------------------------------------------------------------------
| REGISTRATION RULES
|--------------------------------------------------------------------------
*/

describe('Registration Rules', () => {

  it('should successfully register a researcher', async () => {

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Researcher One',
        email: 'researcher@example.com',
        password: 'Password123!',
        role: ROLES.RESEARCHER,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    expect(res.body.data.user.role)
      .toBe(ROLES.RESEARCHER);

    expect(res.body.data.user.status)
      .toBe('pending');

    const user = await User.findOne({
      email: 'researcher@example.com',
    });

    expect(user).not.toBeNull();

    /*
     * Password must not be stored as plaintext.
     */
    expect(user.password_hash)
      .not.toBe('Password123!');

    const logs = await AuditLog.find({
      action: 'REGISTER_SUCCESS',
    });

    expect(logs.length).toBe(1);
  });


  it('should reject admin registration via public endpoint', async () => {

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Admin',
        email: 'admin@example.com',
        password: 'Password123!',
        role: ROLES.ADMIN,
      });

    expect(res.status).toBe(403);

    expect(res.body.success)
      .toBe(false);

    expect(res.body.error.code)
      .toBe('FORBIDDEN');

    const admin = await User.findOne({
      email: 'admin@example.com',
    });

    expect(admin).toBeNull();
  });


  /*
   * REMAINING TEST
   * Admin must not be created through public registration
   * even if hospital_id is supplied.
   */
  it('should reject admin registration containing hospital_id', async () => {

    await Hospital.create({
      hospital_id: 'HOSP_000001',
      name: 'Test Hospital',
      status: 'active',
      client_ids: [],
    });

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Admin With Hospital',
        email: 'adminhospital@example.com',
        password: 'Password123!',
        role: ROLES.ADMIN,
        hospital_id: 'HOSP_000001',
      });

    /*
     * Current implementation correctly rejects public
     * admin registration with 403 FORBIDDEN.
     *
     * If your implementation later validates hospital_id
     * before role authorization, 400 VALIDATION_ERROR
     * would also be acceptable.
     */
    expect([400, 403]).toContain(res.status);

    expect(res.body.success)
      .toBe(false);

    expect([
      'VALIDATION_ERROR',
      'FORBIDDEN',
    ]).toContain(
      res.body.error.code
    );

    const admin = await User.findOne({
      email: 'adminhospital@example.com',
    });

    expect(admin).toBeNull();
  });


  it('should reject hospital_operator without hospital_id', async () => {

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Hospital Operator',
        email: 'operator@example.com',
        password: 'Password123!',
        role: ROLES.HOSPITAL_OPERATOR,
      });

    expect(res.status).toBe(400);

    expect(res.body.error.code)
      .toBe('VALIDATION_ERROR');
  });


  it('should reject researcher with unexpected hospital_id', async () => {

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Researcher',
        email: 'researcher2@example.com',
        password: 'Password123!',
        role: ROLES.RESEARCHER,
        hospital_id: 'HOSP_999999',
      });

    expect(res.status).toBe(400);

    expect(res.body.error.code)
      .toBe('VALIDATION_ERROR');
  });


  it('should reject duplicate email registration', async () => {

    await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Researcher',
        email: 'duplicate@example.com',
        password: 'Password123!',
        role: ROLES.RESEARCHER,
      });

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Researcher Two',
        email: 'duplicate@example.com',
        password: 'Password123!',
        role: ROLES.RESEARCHER,
      });

    expect(res.status).toBe(400);

    expect(res.body.error.code)
      .toBe('EMAIL_ALREADY_EXISTS');
  });

});


/*
|--------------------------------------------------------------------------
| LOGIN & ACCOUNT STATUS
|--------------------------------------------------------------------------
*/

describe('Login & Account Status', () => {

  let researcher;


  beforeEach(async () => {

    researcher = await createActiveUser({
      user_id: 'USR_LOGIN_TEST',
      name: 'Login Test User',
      email: 'login@example.com',
      password: 'Password123!',
      role: ROLES.RESEARCHER,
    });

  });


  it('should allow active user to login', async () => {

    const res = await login(
      'login@example.com',
      'Password123!'
    );

    expect(res.status).toBe(200);

    expect(res.body.success)
      .toBe(true);

    expect(
      res.body.data.access_token
    ).toBeDefined();

    const updatedUser = await User.findOne({
      email: 'login@example.com',
    });

    expect(updatedUser.last_login_at)
      .toBeDefined();

    expect(
      updatedUser.failed_login_attempts
    ).toBe(0);

    const logs = await AuditLog.find({
      action: 'LOGIN_SUCCESS',
    });

    expect(logs.length).toBe(1);
  });


  it('should reject wrong password and increment attempts', async () => {

    const res = await login(
      'login@example.com',
      'WrongPassword!'
    );

    expect(res.status).toBe(401);

    expect(res.body.error.code)
      .toBe('INVALID_CREDENTIALS');

    const updatedUser = await User.findOne({
      email: 'login@example.com',
    });

    expect(
      updatedUser.failed_login_attempts
    ).toBe(1);

    const logs = await AuditLog.find({
      action: 'LOGIN_FAILED',
    });

    expect(logs.length).toBe(1);

    expect(logs[0].metadata.reason)
      .toBe('wrong_password');
  });


  /*
   * REMAINING TEST
   * Temporary account lockout.
   */
  it('should temporarily lock the account after maximum failed login attempts', async () => {

    const maxAttempts = Number(
      process.env.MAX_FAILED_LOGIN_ATTEMPTS || 3
    );


    for (let i = 0; i < maxAttempts; i++) {

      const res = await login(
        'login@example.com',
        'WrongPassword!'
      );

      expect(res.status).toBe(401);

      expect(
        res.body.error.code
      ).toBe('INVALID_CREDENTIALS');
    }


    const lockedUser = await User.findOne({
      email: 'login@example.com',
    });


    expect(
      lockedUser.failed_login_attempts
    ).toBe(maxAttempts);


    expect(
      lockedUser.lock_until
    ).toBeDefined();


    expect(
      new Date(lockedUser.lock_until).getTime()
    ).toBeGreaterThan(Date.now());


    /*
     * Correct password must still fail
     * while the account is locked.
     */
    const lockedLogin = await login(
      'login@example.com',
      'Password123!'
    );


    expect(lockedLogin.status)
      .toBe(401);


    expect(
      lockedLogin.body.error.code
    ).toBe('INVALID_CREDENTIALS');


    /*
     * The response should not reveal
     * account lock information.
     */
    expect(
      JSON.stringify(lockedLogin.body)
    ).not.toMatch(/account is locked/i);


    expect(
      JSON.stringify(lockedLogin.body)
    ).not.toMatch(/locked until/i);

  });


  it('should deny login for pending/suspended/rejected/deactivated accounts', async () => {

    const statuses = [
      'pending',
      'suspended',
      'rejected',
      'deactivated',
    ];


    for (const status of statuses) {

      researcher.status = status;

      researcher.failed_login_attempts = 0;

      researcher.lock_until = null;

      await researcher.save();


      const res = await login(
        'login@example.com',
        'Password123!'
      );


      expect(res.status)
        .toBe(403);


      expect(
        res.body.error.code
      ).toBe(
        `ACCOUNT_${status.toUpperCase()}`
      );

    }

  });


  it('should deny login for nonexistent email', async () => {

    const res = await login(
      'doesnotexist@example.com',
      'Password123!'
    );

    expect(res.status).toBe(401);

    expect(
      res.body.error.code
    ).toBe('INVALID_CREDENTIALS');

  });

});


/*
|--------------------------------------------------------------------------
| JWT AUTHENTICATION
|--------------------------------------------------------------------------
*/

describe('JWT Authentication', () => {

  let user;
  let token;


  beforeEach(async () => {

    user = await createActiveUser({
      user_id: 'USR_JWT_TEST',
      name: 'JWT User',
      email: 'jwt@example.com',
      password: 'Password123!',
      role: ROLES.RESEARCHER,
    });


    const res = await login(
      'jwt@example.com',
      'Password123!'
    );


    token =
      res.body.data.access_token;

  });


  it('should accept a valid JWT token', async () => {

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set(
        'Authorization',
        `Bearer ${token}`
      );

    expect(res.status).toBe(200);

    expect(res.body.success)
      .toBe(true);

    expect(
      res.body.data.user.email
    ).toBe('jwt@example.com');

  });


  it('should reject missing token', async () => {

    const res = await request(app)
      .get('/api/v1/auth/me');

    expect(res.status).toBe(401);

  });


  it('should reject malformed token', async () => {

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set(
        'Authorization',
        'Bearer invalidtoken123'
      );

    expect(res.status).toBe(401);

    expect(
      res.body.error.code
    ).toBe('INVALID_TOKEN');

  });


  /*
   * REMAINING TEST
   * Expired JWT.
   */
  it('should reject an expired JWT token', async () => {

    const expiredToken = jwt.sign(
      {
        sub: user.user_id,
        user_id: user.user_id,
        role: user.role,
        hospital_id: user.hospital_id,
      },

      process.env.JWT_SECRET,

      {
        expiresIn: -10,
      }
    );


    const res = await request(app)
      .get('/api/v1/auth/me')
      .set(
        'Authorization',
        `Bearer ${expiredToken}`
      );


    expect(res.status).toBe(401);

    expect(res.body.success)
      .toBe(false);

    expect(
      res.body.error.code
    ).toBe('TOKEN_EXPIRED');

  });


  it('should reject a JWT signed with the wrong secret', async () => {

    const invalidToken = jwt.sign(
      {
        sub: user.user_id,
        user_id: user.user_id,
        role: ROLES.ADMIN,
        hospital_id: null,
      },

      'wrong-secret',

      {
        expiresIn: '1h',
      }
    );


    const res = await request(app)
      .get('/api/v1/auth/me')
      .set(
        'Authorization',
        `Bearer ${invalidToken}`
      );


    expect(res.status).toBe(401);

    expect(
      res.body.error.code
    ).toBe('INVALID_TOKEN');

  });


  it('should reject a token with a modified admin role if signature is invalid', async () => {

    const decoded = jwt.decode(token);


    /*
     * IMPORTANT:
     *
     * decoded already contains `exp` and `iat`.
     * Therefore we must NOT provide expiresIn
     * again to jwt.sign().
     */

    const forgedToken = jwt.sign(
      {
        ...decoded,
        role: ROLES.ADMIN,
      },

      'attacker-secret'
    );


    const res = await request(app)
      .get('/api/v1/auth/me')
      .set(
        'Authorization',
        `Bearer ${forgedToken}`
      );


    expect(res.status).toBe(401);

    expect(
      res.body.error.code
    ).toBe('INVALID_TOKEN');

  });

});


/*
|--------------------------------------------------------------------------
| LOGOUT
|--------------------------------------------------------------------------
*/

describe('Logout', () => {

  let token;


  beforeEach(async () => {

    await createActiveUser({
      user_id: 'USR_LOGOUT_TEST',
      name: 'Logout User',
      email: 'logout@example.com',
      password: 'Password123!',
      role: ROLES.RESEARCHER,
    });


    const res = await login(
      'logout@example.com',
      'Password123!'
    );


    token =
      res.body.data.access_token;

  });


  it('should successfully log out and create audit event', async () => {

    const res = await request(app)
      .post('/api/v1/auth/logout')
      .set(
        'Authorization',
        `Bearer ${token}`
      );


    expect(res.status).toBe(200);

    expect(res.body.success)
      .toBe(true);


    const logs = await AuditLog.find({
      action: 'LOGOUT',
    });


    expect(logs.length).toBe(1);

  });

});


/*
|--------------------------------------------------------------------------
| CHANGE PASSWORD
|--------------------------------------------------------------------------
*/

describe('Change Password', () => {

  let token;


  beforeEach(async () => {

    await createActiveUser({
      user_id: 'USR_PASSWORD_TEST',
      name: 'Password User',
      email: 'password@example.com',
      password: 'OldPassword123!',
      role: ROLES.RESEARCHER,
    });


    const res = await login(
      'password@example.com',
      'OldPassword123!'
    );


    token =
      res.body.data.access_token;

  });


  it('should successfully change password', async () => {

    const res = await request(app)
      .post('/api/v1/auth/change-password')
      .set(
        'Authorization',
        `Bearer ${token}`
      )
      .send({
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword123!',
      });


    expect(res.status).toBe(200);

    expect(res.body.success)
      .toBe(true);


    /*
     * Old password must stop working.
     */
    const oldLogin = await login(
      'password@example.com',
      'OldPassword123!'
    );


    expect(oldLogin.status)
      .toBe(401);


    expect(
      oldLogin.body.error.code
    ).toBe('INVALID_CREDENTIALS');


    /*
     * New password must work.
     */
    const newLogin = await login(
      'password@example.com',
      'NewPassword123!'
    );


    expect(newLogin.status)
      .toBe(200);


    expect(newLogin.body.success)
      .toBe(true);


    /*
     * Password-change audit event.
     */
    const logs = await AuditLog.find({
      action: 'PASSWORD_CHANGED',
    });


    expect(logs.length).toBe(1);

  });


  it('should reject change-password with incorrect current password', async () => {

    const res = await request(app)
      .post('/api/v1/auth/change-password')
      .set(
        'Authorization',
        `Bearer ${token}`
      )
      .send({
        currentPassword: 'WrongOldPassword!',
        newPassword: 'NewPassword123!',
      });


    expect(res.status).toBe(401);

    expect(
      res.body.error.code
    ).toBe('INVALID_CREDENTIALS');


    /*
     * Original password must still work.
     */
    const loginRes = await login(
      'password@example.com',
      'OldPassword123!'
    );


    expect(loginRes.status)
      .toBe(200);

  });


  it('should reject change-password without authentication', async () => {

    const res = await request(app)
      .post('/api/v1/auth/change-password')
      .send({
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword123!',
      });


    expect(res.status).toBe(401);

  });


  /*
   * IMPORTANT:
   *
   * Your previous test showed that the implementation
   * currently returns HTTP 500 for an invalid new password.
   *
   * That is NOT correct final behavior.
   *
   * This test intentionally expects the correct contract:
   * 400 VALIDATION_ERROR.
   *
   * If this test fails with 500, fix the validator/controller,
   * NOT the test.
   */
  it('should reject an empty new password with validation error', async () => {

    const res = await request(app)
      .post('/api/v1/auth/change-password')
      .set(
        'Authorization',
        `Bearer ${token}`
      )
      .send({
        currentPassword: 'OldPassword123!',
        newPassword: '',
      });


    expect(res.status)
      .toBe(400);


    expect(res.body.success)
      .toBe(false);


    expect(
      res.body.error.code
    ).toBe('VALIDATION_ERROR');

  });

});


/*
|--------------------------------------------------------------------------
| RBAC AND ADMIN ENDPOINTS
|--------------------------------------------------------------------------
*/

describe('RBAC and Admin Endpoints', () => {

  let adminToken;
  let researcherToken;
  let targetUserId;


  beforeEach(async () => {

    await createActiveUser({
      user_id: 'USR_ADMIN_TEST',
      name: 'Admin',
      email: 'admin@test.com',
      password: 'AdminPassword123!',
      role: ROLES.ADMIN,
    });


    await createActiveUser({
      user_id: 'USR_RESEARCHER_TEST',
      name: 'Researcher',
      email: 'researcher@test.com',
      password: 'ResearcherPassword123!',
      role: ROLES.RESEARCHER,
    });


    const targetUser =
      await User.create({
        user_id: 'USR_TARGET_TEST',
        name: 'Target',
        email: 'target@test.com',
        password_hash: 'TargetPassword123!',
        role: ROLES.RESEARCHER,
        status: 'pending',
        hospital_id: null,
      });


    targetUserId =
      targetUser.user_id;


    let res = await login(
      'admin@test.com',
      'AdminPassword123!'
    );


    adminToken =
      res.body.data.access_token;


    res = await login(
      'researcher@test.com',
      'ResearcherPassword123!'
    );


    researcherToken =
      res.body.data.access_token;

  });


  it('should allow admin to approve pending user', async () => {

    const res = await request(app)
      .post(
        `/api/v1/admin/users/${targetUserId}/approve`
      )
      .set(
        'Authorization',
        `Bearer ${adminToken}`
      );


    expect(res.status).toBe(200);


    const updatedUser =
      await User.findOne({
        user_id: targetUserId,
      });


    expect(updatedUser.status)
      .toBe('active');


    const logs = await AuditLog.find({
      action: 'USER_APPROVED',
    });


    expect(logs.length).toBe(1);

  });


  it('should reject researcher from accessing admin endpoint', async () => {

    const res = await request(app)
      .post(
        `/api/v1/admin/users/${targetUserId}/approve`
      )
      .set(
        'Authorization',
        `Bearer ${researcherToken}`
      );


    expect(res.status).toBe(403);


    expect(
      res.body.error.code
    ).toBe('FORBIDDEN');

  });

});


/*
|--------------------------------------------------------------------------
| HOSPITAL ISOLATION
|--------------------------------------------------------------------------
*/

describe('Hospital Isolation', () => {

  let op1Token;
  let op2Token;


  beforeEach(async () => {

    /*
     * Test-only route to test Module 1
     * hospital isolation middleware.
     */
    app.get(
      '/api/v1/hospitals/:hospital_id/data',

      requireAuth,

      requireHospitalAccess,

      (req, res) => {

        res.status(200).json({
          success: true,
          data: 'hospital data',
        });

      }
    );


    await Hospital.create({
      hospital_id: 'HOSP_1',
      name: 'Hospital One',
      status: 'active',
      client_ids: [],
    });


    await Hospital.create({
      hospital_id: 'HOSP_2',
      name: 'Hospital Two',
      status: 'active',
      client_ids: [],
    });


    await createActiveUser({
      user_id: 'USR_OP1',
      name: 'Operator One',
      email: 'op1@example.com',
      password: 'OperatorPassword123!',
      role: ROLES.HOSPITAL_OPERATOR,
      hospital_id: 'HOSP_1',
    });


    await createActiveUser({
      user_id: 'USR_OP2',
      name: 'Operator Two',
      email: 'op2@example.com',
      password: 'OperatorPassword123!',
      role: ROLES.HOSPITAL_OPERATOR,
      hospital_id: 'HOSP_2',
    });


    let res = await login(
      'op1@example.com',
      'OperatorPassword123!'
    );


    op1Token =
      res.body.data.access_token;


    res = await login(
      'op2@example.com',
      'OperatorPassword123!'
    );


    op2Token =
      res.body.data.access_token;

  });


  it('operator can access their own hospital', async () => {

    const res = await request(app)
      .get(
        '/api/v1/hospitals/HOSP_1/data'
      )
      .set(
        'Authorization',
        `Bearer ${op1Token}`
      );


    expect(res.status)
      .toBe(200);

  });


  it('operator cannot access another hospital', async () => {

    const res = await request(app)
      .get(
        '/api/v1/hospitals/HOSP_2/data'
      )
      .set(
        'Authorization',
        `Bearer ${op1Token}`
      );


    expect(res.status)
      .toBe(403);


    expect(
      res.body.error.code
    ).toBe(
      'HOSPITAL_ACCESS_DENIED'
    );

  });


  it('second operator can access their own hospital', async () => {

    const res = await request(app)
      .get(
        '/api/v1/hospitals/HOSP_2/data'
      )
      .set(
        'Authorization',
        `Bearer ${op2Token}`
      );


    expect(res.status)
      .toBe(200);

  });

});


/*
|--------------------------------------------------------------------------
| AUDIT LOG SECURITY
|--------------------------------------------------------------------------
*/

describe('Audit Log Security', () => {

  /*
   * REMAINING TEST
   */
  it('should strip sensitive keys from audit metadata', async () => {

    await AuditService.logEvent({

      user_id: 'USR_AUDIT_TEST',

      action: 'TEST_SECURITY_EVENT',

      resource_type: 'Test',

      resource_id: 'TEST_001',

      hospital_id: 'HOSP_000001',

      ip_address: '127.0.0.1',

      user_agent: 'Jest',

      success: true,

      metadata: {

        password: 'SecretPassword123!',

        password_hash: 'bcrypt-hash',

        token: 'eyJfake-token',

        jwt: 'fake-jwt',

        secret: 'super-secret',

        normal_field: 'this should remain',

      },

    });


    const log =
      await AuditLog.findOne({
        action: 'TEST_SECURITY_EVENT',
      }).lean();


    expect(log)
      .not.toBeNull();


    expect(
      log.metadata.normal_field
    ).toBe(
      'this should remain'
    );


    expect(
      log.metadata.password
    ).toBeUndefined();


    expect(
      log.metadata.password_hash
    ).toBeUndefined();


    expect(
      log.metadata.token
    ).toBeUndefined();


    expect(
      log.metadata.jwt
    ).toBeUndefined();


    expect(
      log.metadata.secret
    ).toBeUndefined();

  });


  it('should not store password hash in normal API responses', async () => {

    await createActiveUser({
      user_id: 'USR_SECRET_TEST',
      name: 'Secret Test',
      email: 'secret@example.com',
      password: 'Password123!',
      role: ROLES.RESEARCHER,
    });


    const res = await login(
      'secret@example.com',
      'Password123!'
    );


    expect(
      res.body.data.user.password_hash
    ).toBeUndefined();


    const me = await request(app)
      .get('/api/v1/auth/me')
      .set(
        'Authorization',
        `Bearer ${res.body.data.access_token}`
      );


    expect(
      me.body.data.user.password_hash
    ).toBeUndefined();

  });

});