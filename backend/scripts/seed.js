/* ============================================================
   LCC Job Portal — Seed Script
   Creates a sample employer + jobseeker + a handful of jobs.
   Run with:  npm run seed
   ============================================================ */
require('dotenv').config();
const mongoose = require('mongoose');

const User        = require('../models/User');
const Job         = require('../models/Job');
const Application = require('../models/Application');

async function run() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI not set. Aborting.');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('✓ Connected to MongoDB');

  console.log('Cleaning existing seed data...');
  await Promise.all([
    User.deleteMany({ email: { $in: ['hr@lccdemo.com', 'fresher@lccdemo.com'] } }),
    Job.deleteMany({ company: 'LCC Demo Pvt Ltd' }),
    Application.deleteMany({})
  ]);

  // Sample users
  const employer = await new User({
    name: 'LCC Demo HR',
    email: 'hr@lccdemo.com',
    password: 'demo1234',
    role: 'employer',
    company: 'LCC Demo Pvt Ltd',
    phone: '+91 91961 09055',
    location: 'Lucknow'
  }).save();

  const jobseeker = await new User({
    name: 'Demo Fresher',
    email: 'fresher@lccdemo.com',
    password: 'demo1234',
    role: 'jobseeker',
    headline: 'B.Tech CSE 2026 · Looking for SDE roles',
    location: 'Lucknow',
    skills: ['JavaScript', 'React', 'Node.js', 'MongoDB']
  }).save();

  console.log('✓ Users created');
  console.log('   Employer:  hr@lccdemo.com / demo1234');
  console.log('   Jobseeker: fresher@lccdemo.com / demo1234');

  const jobsData = [
    {
      title: 'Full-Stack Developer (MERN)',
      location: 'Lucknow / Hybrid',
      salary: '6-9 LPA',
      type: 'Full-Time',
      industry: 'Information Technology',
      experience: '1-3 years',
      skills: ['MongoDB', 'Express', 'React', 'Node.js'],
      description:
        'Build and ship features end-to-end using the MERN stack. Collaborate with designers and PMs to deliver delightful user experiences. Own modules from API design to UI.'
    },
    {
      title: 'Relationship Manager — Banking',
      location: 'Lucknow',
      salary: '3.5-5 LPA + incentives',
      type: 'Full-Time',
      industry: 'Banking & Financial Services',
      experience: '0-2 years',
      skills: ['Sales', 'Communication', 'Banking products'],
      description:
        'Drive customer acquisition for retail banking products. Manage portfolio of HNI clients, cross-sell investments, loans and insurance. Excellent grooming required.'
    },
    {
      title: 'Hospital Operations Executive',
      location: 'Lucknow',
      salary: '3-4 LPA',
      type: 'Full-Time',
      industry: 'Healthcare & Life Sciences',
      experience: '0-1 years',
      skills: ['Operations', 'Customer service', 'MS Office'],
      description:
        'Coordinate front-desk operations, OPD scheduling, vendor management and patient experience initiatives across a 200-bed multi-speciality hospital.'
    },
    {
      title: 'Store Manager — FMCG Retail',
      location: 'Lucknow',
      salary: '4-6 LPA',
      type: 'Full-Time',
      industry: 'Retail & Consumer Goods',
      experience: '2-5 years',
      skills: ['Team management', 'Inventory', 'Customer experience'],
      description:
        'Run end-to-end operations of a flagship retail store: hiring, scheduling, inventory, P&L ownership and customer experience metrics.'
    },
    {
      title: 'Data Analyst Intern',
      location: 'Remote',
      salary: '15K-20K /month',
      type: 'Internship',
      industry: 'Information Technology',
      experience: 'Fresher',
      skills: ['SQL', 'Excel', 'Power BI'],
      description:
        '3-month internship with conversion-to-FTE. Work on dashboards, ad-hoc analysis and data-quality projects. Learn from senior analysts.'
    },
    {
      title: 'Payroll & Compliance Executive',
      location: 'Lucknow',
      salary: '3-4.5 LPA',
      type: 'Contract',
      industry: 'HR / Operations',
      experience: '1-3 years',
      skills: ['Payroll', 'PF/ESI', 'Statutory compliance'],
      description:
        'Manage monthly payroll cycles, statutory filings (PF, ESI, PT, TDS), reimbursements and audits across 200+ contract workforce.'
    }
  ];

  const inserted = await Job.insertMany(
    jobsData.map((j) => ({ ...j, company: employer.company, employerId: employer._id }))
  );
  console.log(`✓ ${inserted.length} jobs created`);

  await mongoose.disconnect();
  console.log('✓ Seed complete. Disconnected.');
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
