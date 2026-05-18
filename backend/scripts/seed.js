/* ============================================================
   LCC Consultancy Platform — Seed Script
   Creates admin + sample employer + jobseeker + jobs + blogs.
   Run with:  npm run seed
   ============================================================ */
require('dotenv').config();
const mongoose = require('mongoose');

const User          = require('../models/User');
const Job           = require('../models/Job');
const Application   = require('../models/Application');
const Blog          = require('../models/Blog');
const HiringRequest = require('../models/HiringRequest');

const ADMIN_EMAIL    = process.env.ADMIN_EMAIL || 'admin@lcc.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin1234';

async function run() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI not set. Aborting.');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('✓ Connected to MongoDB');

  const seedEmails = [ADMIN_EMAIL, 'hr@lccdemo.com', 'fresher@lccdemo.com'];

  console.log('Cleaning existing seed data...');
  const seedUsers = await User.find({ email: { $in: seedEmails } }).select('_id');
  const seedUserIds = seedUsers.map((u) => u._id);

  await Promise.all([
    User.deleteMany({ email: { $in: seedEmails } }),
    Job.deleteMany({ $or: [{ company: 'LCC Demo Pvt Ltd' }, { postedBy: { $in: seedUserIds } }] }),
    Blog.deleteMany({ slug: { $in: ['bridging-college-to-career', 'speed-to-hire-insights', 'placement-success-story'] } }),
    Application.deleteMany({}),
    HiringRequest.deleteMany({ email: 'hr@lccdemo.com' })
  ]);

  const admin = await new User({
    name: 'LCC Admin',
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    role: 'admin',
    phone: '+91 91961 09055',
    location: 'Lucknow'
  }).save();

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
  console.log(`   Admin:     ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
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
      isFeatured: true,
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
      isFeatured: true,
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
      isFeatured: true,
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
    jobsData.map((j) => ({
      ...j,
      company: 'LCC Partner Network',
      postedBy: admin._id,
      employerId: null
    }))
  );
  console.log(`✓ ${inserted.length} jobs created (admin-managed)`);

  const blogsData = [
    {
      title: 'Bridging College to Career: The LCC Approach',
      slug: 'bridging-college-to-career',
      excerpt: 'How structured training and recruitment support help fresh graduates become industry-ready professionals.',
      category: 'Career Tips',
      isFeatured: true,
      isPublished: true,
      publishedAt: new Date(),
      authorId: admin._id,
      content: '<p>At Lead Connects Career, we believe India\'s youth has immense potential — they need the right platform, mentorship, and opportunities.</p><p>Our dual model of recruitment consultancy and job-support training ensures candidates are not just placed, but prepared.</p>'
    },
    {
      title: 'Speed-to-Hire: What Employers Should Expect from a Consultancy',
      slug: 'speed-to-hire-insights',
      excerpt: 'Why premium recruitment partners deliver faster, higher-quality hires than generic job boards.',
      category: 'Hiring Insights',
      isPublished: true,
      publishedAt: new Date(),
      authorId: admin._id,
      content: '<p>When you partner with a consultancy like LCC, you gain pre-screened talent pipelines, domain expertise, and dedicated account management.</p><p>Average time-to-hire across our client base: 14 days.</p>'
    },
    {
      title: 'Placement Success: From Campus to Corporate in 30 Days',
      slug: 'placement-success-story',
      excerpt: 'A recent success story placing MERN developers for a growing tech firm in Lucknow.',
      category: 'Success Stories',
      isPublished: true,
      publishedAt: new Date(),
      authorId: admin._id,
      content: '<p>Within 30 days of engagement, LCC delivered 4 qualified MERN developers — all still with the client after 6 months.</p><p>This is the power of consultancy-led hiring.</p>'
    }
  ];

  await Blog.insertMany(blogsData);
  console.log(`✓ ${blogsData.length} blog posts created`);

  await mongoose.disconnect();
  console.log('✓ Seed complete. Disconnected.');
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
