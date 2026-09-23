require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./connection/db');
const User = require('../authentication/models/User');
const Hospital = require('../authentication/models/Hospital');

const seedData = async () => {
  try {
    await connectDB();
    console.log('Seeding initial Consortium & Hospital data...');

    // 1. Seed Default Hospital
    const defaultHospital = await Hospital.findOneAndUpdate(
      { hospital_id: 'HOSP_000001' },
      {
        hospital_id: 'HOSP_000001',
        name: 'St. Jude Clinical Research & AI Node',
        status: 'active',
        client_ids: ['client_hosp_001', 'client_hosp_002']
      },
      { upsert: true, new: true }
    );
    console.log(`[Seed] Hospital ensured: ${defaultHospital.name} (${defaultHospital.hospital_id})`);

    // 2. Seed Hospital Operator (matches hospital-desktop auth)
    let operator = await User.findOne({ email: 'operator@stjude-clinical.org' });
    if (!operator) {
      operator = new User({
        user_id: 'USR_h7c2d9e4a1b0',
        name: 'Dr. Marcus Vance (Lead Clinical AI Operator)',
        email: 'operator@stjude-clinical.org',
        password_hash: 'hospital123',
        role: 'hospital_operator',
        hospital_id: 'HOSP_000001',
        status: 'active'
      });
      await operator.save();
      console.log(`[Seed] Hospital operator created: ${operator.email} (password: hospital123)`);
    } else {
      console.log(`[Seed] Hospital operator already exists: ${operator.email}`);
    }

    // 3. Seed Researcher
    let researcher = await User.findOne({ email: 'e.rostova@med.stanford.edu' });
    if (!researcher) {
      researcher = new User({
        user_id: 'USR_r1e8a9d3c5f2',
        name: 'Dr. Elena Rostova, M.D., Ph.D.',
        email: 'e.rostova@med.stanford.edu',
        password_hash: 'researcher123',
        role: 'researcher',
        status: 'active'
      });
      await researcher.save();
      console.log(`[Seed] Researcher created: ${researcher.email} (password: researcher123)`);
    } else {
      console.log(`[Seed] Researcher already exists: ${researcher.email}`);
    }

    // 4. Seed Admin
    let admin = await User.findOne({ email: 'admin@consortium.org' });
    if (!admin) {
      admin = new User({
        user_id: 'USR_a0b1c2d3e4f5',
        name: 'Consortium Root Administrator',
        email: 'admin@consortium.org',
        password_hash: 'admin123',
        role: 'admin',
        status: 'active'
      });
      await admin.save();
      console.log(`[Seed] Consortium Admin created: ${admin.email} (password: admin123)`);
    } else {
      console.log(`[Seed] Consortium Admin already exists: ${admin.email}`);
    }

    console.log('✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  }
};

seedData();
