require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./connection/db');
const User = require('../authentication/models/User');
const Hospital = require('../authentication/models/Hospital');
const TrainingRequest = require('../models/TrainingRequest');
const StoredModel = require('../models/StoredModel');

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
    let operator = await User.findOne({ email: 'operator@stjude-clinical.org', role: 'hospital_operator' });
    if (!operator) {
      operator = new User({
        user_id: 'USR_h7c2d9e4a1b0',
        account_id: 'HOS-001',
        name: 'Dr. Marcus Vance (Lead Clinical AI Operator)',
        email: 'operator@stjude-clinical.org',
        password_hash: 'hospital123',
        role: 'hospital_operator',
        hospital_id: 'HOSP_000001',
        status: 'active'
      });
      await operator.save();
      console.log(`[Seed] Hospital operator created: ${operator.email} (password: hospital123, account: HOS-001)`);
    } else {
      if (!operator.account_id) {
        operator.account_id = 'HOS-001';
        await operator.save();
      }
      console.log(`[Seed] Hospital operator already exists: ${operator.email}`);
    }

    // 3. Seed Researcher (Active)
    let researcher = await User.findOne({ email: 'e.rostova@med.stanford.edu', role: 'researcher' });
    if (!researcher) {
      researcher = new User({
        user_id: 'USR_r1e8a9d3c5f2',
        account_id: 'RES-001',
        name: 'Dr. Elena Rostova, M.D., Ph.D.',
        email: 'e.rostova@med.stanford.edu',
        password_hash: 'researcher123',
        role: 'researcher',
        status: 'active'
      });
      await researcher.save();
      console.log(`[Seed] Researcher created: ${researcher.email} (password: researcher123, account: RES-001)`);
    } else {
      if (!researcher.account_id) {
        researcher.account_id = 'RES-001';
        await researcher.save();
      }
      console.log(`[Seed] Researcher already exists: ${researcher.email}`);
    }

    // 4. Seed Pending Researcher (For testing Admin approval workflow)
    let pendingResearcher = await User.findOne({ email: 'pending.researcher@med.harvard.edu', role: 'researcher' });
    if (!pendingResearcher) {
      pendingResearcher = new User({
        user_id: 'USR_p9a8b7c6d5e4',
        account_id: 'RES-002',
        name: 'Dr. Arthur Pendelton, Ph.D.',
        email: 'pending.researcher@med.harvard.edu',
        password_hash: 'researcher123',
        role: 'researcher',
        status: 'pending'
      });
      await pendingResearcher.save();
      console.log(`[Seed] Pending Researcher created: ${pendingResearcher.email} (status: pending, account: RES-002)`);
    }

    // 5. Seed Admin
    let admin = await User.findOne({ email: 'admin@consortium.org', role: 'admin' });
    if (!admin) {
      admin = new User({
        user_id: 'USR_a0b1c2d3e4f5',
        account_id: 'ADM-001',
        name: 'Consortium Root Administrator',
        email: 'admin@consortium.org',
        password_hash: 'admin123',
        role: 'admin',
        status: 'active'
      });
      await admin.save();
      console.log(`[Seed] Consortium Admin created: ${admin.email} (password: admin123, account: ADM-001)`);
    } else {
      if (!admin.account_id) {
        admin.account_id = 'ADM-001';
        await admin.save();
      }
      console.log(`[Seed] Consortium Admin already exists: ${admin.email}`);
    }

    // 6. Seed Sample Training Requests
    const malariaRequest = await TrainingRequest.findOneAndUpdate(
      { request_id: 'REQ_malaria_001' },
      {
        request_id: 'REQ_malaria_001',
        researcher_id: researcher.user_id,
        researcher_name: researcher.name,
        disease: 'Malaria',
        task: 'Image Classification',
        description: 'Multi-institutional thin blood smear parasite detection and cell staging.',
        status: 'OPEN',
        model_architecture: 'ResNet-18',
        model_version: 'v1',
        participating_hospitals: [],
        training_config: { target_epochs: 10, batch_size: 16, learning_rate: 0.001 }
      },
      { upsert: true, new: true }
    );
    console.log(`[Seed] Training Request ensured: ${malariaRequest.disease} (${malariaRequest.request_id})`);

    const pneumoniaRequest = await TrainingRequest.findOneAndUpdate(
      { request_id: 'REQ_pneumonia_002' },
      {
        request_id: 'REQ_pneumonia_002',
        researcher_id: researcher.user_id,
        researcher_name: researcher.name,
        disease: 'Pneumonia',
        task: 'Image Classification',
        description: 'Pediatric chest radiograph opacity classification across consortium ring nodes.',
        status: 'ACTIVE',
        model_architecture: 'DenseNet-121',
        model_version: 'v1',
        participating_hospitals: [
          {
            hospital_id: 'HOSP_000001',
            hospital_name: 'St. Jude Clinical Research & AI Node',
            status: 'ACCEPTED',
            joined_at: new Date(Date.now() - 3600000),
            training_metrics: {
              current_epoch: null,
              total_epochs: null,
              loss: null,
              accuracy: null,
              status: 'Waiting for training session'
            }
          }
        ],
        training_config: { target_epochs: 15, batch_size: 8, learning_rate: 0.0005 }
      },
      { upsert: true, new: true }
    );
    console.log(`[Seed] Training Request ensured: ${pneumoniaRequest.disease} (${pneumoniaRequest.request_id})`);

    // 7. Seed Sample Stored Models (with explicit versions)
    await StoredModel.findOneAndUpdate(
      { model_id: 'MOD_malaria_v1' },
      {
        model_id: 'MOD_malaria_v1',
        request_id: 'REQ_malaria_001',
        disease: 'Malaria',
        task: 'Image Classification',
        architecture: 'ResNet-18',
        version: 'v1',
        status: 'APPROVED',
        metadata_path: 'models/malaria_v1.meta.json',
        sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
      },
      { upsert: true, new: true }
    );

    await StoredModel.findOneAndUpdate(
      { model_id: 'MOD_malaria_v2' },
      {
        model_id: 'MOD_malaria_v2',
        request_id: 'REQ_malaria_001',
        disease: 'Malaria',
        task: 'Image Classification',
        architecture: 'EfficientNet-B0',
        version: 'v2',
        status: 'APPROVED',
        metadata_path: 'models/malaria_v2.meta.json',
        sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'
      },
      { upsert: true, new: true }
    );

    await StoredModel.findOneAndUpdate(
      { model_id: 'MOD_pneumonia_v1' },
      {
        model_id: 'MOD_pneumonia_v1',
        request_id: 'REQ_pneumonia_002',
        disease: 'Pneumonia',
        task: 'Image Classification',
        architecture: 'DenseNet-121',
        version: 'v1',
        status: 'APPROVED',
        metadata_path: 'models/pneumonia_v1.meta.json',
        sha256: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'
      },
      { upsert: true, new: true }
    );
    console.log('[Seed] Stored Models ensured with explicit versions (v1, v2).');

    console.log('✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  }
};

seedData();
