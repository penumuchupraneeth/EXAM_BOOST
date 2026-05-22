/**
 * Seed Script — Run with: npm run seed
 * Populates the database with real academic resources
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');
const Resource = require('../models/Resource');

const categories = [
  { name: 'Computer Science', slug: 'computer-science', icon: '💻', description: 'CS, programming, algorithms' },
  { name: 'Electronics', slug: 'electronics', icon: '⚡', description: 'ECE, circuits, embedded systems' },
  { name: 'Sciences', slug: 'sciences', icon: '🔬', description: 'Physics, chemistry, biology' },
  { name: 'Mathematics', slug: 'mathematics', icon: '📐', description: 'Calculus, algebra, statistics' },
  { name: 'Mechanical', slug: 'mechanical', icon: '⚙️', description: 'Mechanical engineering resources' },
  { name: 'Civil', slug: 'civil', icon: '🏗️', description: 'Civil & structural engineering' },
  { name: 'Life Sciences', slug: 'life-sciences', icon: '💊', description: 'Biotechnology, pharma, life sci' },
  { name: 'Management', slug: 'management', icon: '📊', description: 'MBA, business, finance' },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Resource.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    const createdCategories = await Category.insertMany(categories);
    console.log('Created ' + createdCategories.length + ' categories');

    const admin = await User.create({
      name: 'Admin Pettava',
      email: 'admin@pettava.com',
      password: 'admin123',
      course: 'Platform Admin',
      role: 'admin',
      points: 500,
    });

    const student = await User.create({
      name: 'Rahul Sharma',
      email: 'rahul@college.edu',
      password: 'student123',
      course: 'B.Tech CSE 3rd Year',
      points: 120,
    });

    console.log('Created users');

    const cs    = createdCategories.find(c => c.slug === 'computer-science');
    const ece   = createdCategories.find(c => c.slug === 'electronics');
    const math  = createdCategories.find(c => c.slug === 'mathematics');
    const mech  = createdCategories.find(c => c.slug === 'mechanical');
    const sci   = createdCategories.find(c => c.slug === 'sciences');
    const mgmt  = createdCategories.find(c => c.slug === 'management');
    const life  = createdCategories.find(c => c.slug === 'life-sciences');
    const civil = createdCategories.find(c => c.slug === 'civil');

    const resources = [
      // COMPUTER SCIENCE
      {
        title: 'Data Structures & Algorithms - NPTEL IIT Delhi',
        description: 'Complete lecture notes from IIT on arrays, linked lists, stacks, queues, trees, graphs and sorting.',
        type: 'video', subject: 'Data Structures & Algorithms', courseCode: 'CSE301',
        category: cs._id, uploadedBy: student._id,
        fileUrl: 'https://nptel.ac.in/courses/106/102/106102064/',
        fileFormat: 'web', year: 2024, professor: 'Prof. Naveen Garg (IIT Delhi)',
        tags: ['dsa', 'algorithms', 'trees', 'graphs', 'nptel'],
        views: 1240, downloads: 432, saves: 89, isApproved: true,
      },
      {
        title: 'Operating Systems - Complete Notes (UIC)',
        description: 'Processes, threads, memory management, file systems, deadlocks and scheduling.',
        type: 'notes', subject: 'Operating Systems', courseCode: 'CSE302',
        category: cs._id, uploadedBy: admin._id,
        fileUrl: 'https://www.cs.uic.edu/~jbell/CourseNotes/OperatingSystems/',
        fileFormat: 'web', year: 2024, professor: 'Prof. Jim Bell (UIC)',
        tags: ['os', 'operating systems', 'processes', 'memory', 'deadlock'],
        views: 890, downloads: 310, saves: 60, isApproved: true,
      },
      {
        title: 'Database Management Systems - NPTEL IIT Madras',
        description: 'ER diagrams, SQL, normalization, transactions and query optimization.',
        type: 'video', subject: 'Database Management Systems', courseCode: 'CSE304',
        category: cs._id, uploadedBy: student._id,
        fileUrl: 'https://nptel.ac.in/courses/106/106/106106093/',
        fileFormat: 'web', year: 2024, professor: 'Prof. Partha Pratim Das (IIT Madras)',
        tags: ['dbms', 'database', 'sql', 'normalization', 'nptel'],
        views: 2100, downloads: 980, saves: 210, isApproved: true,
      },
      {
        title: 'Machine Learning - Stanford CS229 Full Notes',
        description: 'Andrew Ng complete ML notes - regression, neural nets, SVM, unsupervised learning.',
        type: 'notes', subject: 'Machine Learning', courseCode: 'CSE501',
        category: cs._id, uploadedBy: admin._id,
        fileUrl: 'https://cs229.stanford.edu/notes2022fall/main_notes.pdf',
        fileFormat: 'application/pdf', year: 2024, professor: 'Prof. Andrew Ng (Stanford)',
        tags: ['machine learning', 'ai', 'neural networks', 'svm', 'stanford'],
        views: 3200, downloads: 1800, saves: 420, isApproved: true,
      },
      {
        title: 'Python Programming - Full Beginner to Advanced',
        description: 'Complete Python from basics to OOP, file handling, libraries and real projects.',
        type: 'video', subject: 'Programming in Python', courseCode: 'CSE201',
        category: cs._id, uploadedBy: student._id,
        fileUrl: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc',
        fileFormat: 'video/youtube', year: 2024, professor: 'Programming with Mosh',
        tags: ['python', 'programming', 'beginner', 'oop', 'coding'],
        views: 4500, downloads: 0, saves: 630, isApproved: true,
      },
      {
        title: 'Computer Networks - NPTEL Course',
        description: 'OSI model, TCP/IP, routing, transport layer and application protocols.',
        type: 'video', subject: 'Computer Networks', courseCode: 'CSE401',
        category: cs._id, uploadedBy: admin._id,
        fileUrl: 'https://nptel.ac.in/courses/106/105/106105081/',
        fileFormat: 'web', year: 2024, professor: 'Prof. S. Ghosh (IIT Kharagpur)',
        tags: ['networks', 'tcp ip', 'osi', 'routing', 'protocols'],
        views: 760, downloads: 290, saves: 75, isApproved: true,
      },
      {
        title: 'Software Engineering - NPTEL IIT Kharagpur',
        description: 'SDLC models, agile, requirements, design patterns, testing and project management.',
        type: 'video', subject: 'Software Engineering', courseCode: 'CSE402',
        category: cs._id, uploadedBy: student._id,
        fileUrl: 'https://nptel.ac.in/courses/106/105/106105182/',
        fileFormat: 'web', year: 2024, professor: 'Prof. Rajib Mall (IIT Kharagpur)',
        tags: ['software engineering', 'sdlc', 'agile', 'testing'],
        views: 540, downloads: 210, saves: 45, isApproved: true,
      },
      {
        title: 'Compiler Design - NPTEL IIT Kanpur',
        description: 'Lexical analysis, parsing, syntax-directed translation and code generation.',
        type: 'video', subject: 'Compiler Design', courseCode: 'CSE403',
        category: cs._id, uploadedBy: admin._id,
        fileUrl: 'https://nptel.ac.in/courses/106/105/106105190/',
        fileFormat: 'web', year: 2023, professor: 'Prof. Y.N. Singh (IIT Kanpur)',
        tags: ['compiler', 'lexical analysis', 'parsing', 'code generation'],
        views: 430, downloads: 180, saves: 38, isApproved: true,
      },

      // MATHEMATICS
      {
        title: 'Engineering Mathematics - Calculus & Transforms NPTEL',
        description: 'Laplace transforms, Fourier series, multivariable calculus, differential equations.',
        type: 'video', subject: 'Engineering Mathematics', courseCode: 'MATH201',
        category: math._id, uploadedBy: admin._id,
        fileUrl: 'https://nptel.ac.in/courses/111/107/111107108/',
        fileFormat: 'web', year: 2024, professor: 'Prof. Jitendra Kumar (IIT Kharagpur)',
        tags: ['mathematics', 'calculus', 'laplace', 'fourier', 'transforms'],
        views: 670, downloads: 289, saves: 55, isApproved: true,
      },
      {
        title: 'Linear Algebra - MIT OpenCourseWare (Gilbert Strang)',
        description: 'Vectors, matrices, determinants, eigenvalues and linear transformations - best LA course worldwide.',
        type: 'video', subject: 'Linear Algebra', courseCode: 'MATH202',
        category: math._id, uploadedBy: student._id,
        fileUrl: 'https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/',
        fileFormat: 'web', year: 2024, professor: 'Prof. Gilbert Strang (MIT)',
        tags: ['linear algebra', 'matrices', 'eigenvalues', 'mit', 'vectors'],
        views: 2800, downloads: 900, saves: 380, isApproved: true,
      },
      {
        title: 'Probability & Statistics - NPTEL IIT Kharagpur',
        description: 'Probability theory, distributions, hypothesis testing, regression and statistical inference.',
        type: 'video', subject: 'Probability and Statistics', courseCode: 'MATH301',
        category: math._id, uploadedBy: admin._id,
        fileUrl: 'https://nptel.ac.in/courses/111/105/111105041/',
        fileFormat: 'web', year: 2024, professor: 'Prof. Somesh Kumar (IIT Kharagpur)',
        tags: ['probability', 'statistics', 'distributions', 'hypothesis testing'],
        views: 890, downloads: 340, saves: 95, isApproved: true,
      },

      // ELECTRONICS
      {
        title: 'Basic Electronics - Circuits & Devices NPTEL',
        description: 'Diodes, transistors, op-amps, logic gates and digital circuits fundamentals.',
        type: 'video', subject: 'Basic Electronics', courseCode: 'ECE201',
        category: ece._id, uploadedBy: student._id,
        fileUrl: 'https://nptel.ac.in/courses/108/105/108105132/',
        fileFormat: 'web', year: 2024, professor: 'Prof. T.S. Natarajan (IIT Madras)',
        tags: ['electronics', 'circuits', 'diodes', 'transistors', 'op-amp'],
        views: 760, downloads: 210, saves: 68, isApproved: true,
      },
      {
        title: 'Digital Signal Processing - IIT Delhi',
        description: 'Signals, systems, Z-transform, DFT, FFT and digital filter design.',
        type: 'video', subject: 'Digital Signal Processing', courseCode: 'ECE301',
        category: ece._id, uploadedBy: admin._id,
        fileUrl: 'https://nptel.ac.in/courses/117/101/117101055/',
        fileFormat: 'web', year: 2024, professor: 'Prof. S.C. Dutta Roy (IIT Delhi)',
        tags: ['dsp', 'signal processing', 'fft', 'z-transform', 'filters'],
        views: 540, downloads: 190, saves: 42, isApproved: true,
      },
      {
        title: 'VLSI Design - IIT Madras Complete Course',
        description: 'CMOS logic, circuit design, layout, timing analysis and FPGA programming.',
        type: 'video', subject: 'VLSI Design', courseCode: 'ECE401',
        category: ece._id, uploadedBy: student._id,
        fileUrl: 'https://nptel.ac.in/courses/117/105/117105053/',
        fileFormat: 'web', year: 2023, professor: 'Prof. S. Srinivasan (IIT Madras)',
        tags: ['vlsi', 'cmos', 'fpga', 'circuit design'],
        views: 380, downloads: 145, saves: 32, isApproved: true,
      },

      // MECHANICAL
      {
        title: 'Thermodynamics - Engineering Complete NPTEL',
        description: 'Laws of thermodynamics, cycles, entropy, heat engines and refrigeration.',
        type: 'video', subject: 'Thermodynamics', courseCode: 'MECH201',
        category: mech._id, uploadedBy: admin._id,
        fileUrl: 'https://nptel.ac.in/courses/112/105/112105123/',
        fileFormat: 'web', year: 2024, professor: 'Prof. U.S.P. Shet (IIT Madras)',
        tags: ['thermodynamics', 'heat', 'entropy', 'cycles', 'mechanical'],
        views: 620, downloads: 230, saves: 58, isApproved: true,
      },
      {
        title: 'Fluid Mechanics - IIT Kharagpur Video Lectures',
        description: 'Fluid statics, dynamics, Bernoulli, viscous flow, turbulence and pipe flow.',
        type: 'video', subject: 'Fluid Mechanics', courseCode: 'MECH301',
        category: mech._id, uploadedBy: student._id,
        fileUrl: 'https://nptel.ac.in/courses/112/105/112105171/',
        fileFormat: 'web', year: 2024, professor: 'Prof. Suman Chakraborty (IIT Kharagpur)',
        tags: ['fluid mechanics', 'bernoulli', 'viscous flow', 'turbulence'],
        views: 480, downloads: 175, saves: 44, isApproved: true,
      },

      // SCIENCES
      {
        title: 'Engineering Physics - Complete Notes NPTEL',
        description: 'Quantum mechanics, optics, semiconductors, superconductors and modern physics.',
        type: 'video', subject: 'Engineering Physics', courseCode: 'PHY101',
        category: sci._id, uploadedBy: admin._id,
        fileUrl: 'https://nptel.ac.in/courses/115/103/115103111/',
        fileFormat: 'web', year: 2024, professor: 'Prof. V. Madhurima (IIT)',
        tags: ['physics', 'quantum mechanics', 'optics', 'semiconductors'],
        views: 540, downloads: 210, saves: 48, isApproved: true,
      },
      {
        title: 'Engineering Chemistry - NPTEL IIT Madras',
        description: 'Electrochemistry, polymers, corrosion, fuels, water treatment and spectroscopy.',
        type: 'video', subject: 'Engineering Chemistry', courseCode: 'CHEM101',
        category: sci._id, uploadedBy: student._id,
        fileUrl: 'https://nptel.ac.in/courses/104/105/104105105/',
        fileFormat: 'web', year: 2024, professor: 'Prof. T. Pradeep (IIT Madras)',
        tags: ['chemistry', 'electrochemistry', 'polymers', 'corrosion'],
        views: 390, downloads: 155, saves: 35, isApproved: true,
      },

      // MANAGEMENT
      {
        title: 'Principles of Management - NPTEL IIM',
        description: 'Planning, organizing, staffing, directing and controlling with management theories.',
        type: 'video', subject: 'Principles of Management', courseCode: 'MBA101',
        category: mgmt._id, uploadedBy: admin._id,
        fileUrl: 'https://nptel.ac.in/courses/110/105/110105049/',
        fileFormat: 'web', year: 2024, professor: 'Prof. B.S. Sahay (IIM)',
        tags: ['management', 'planning', 'organizing', 'leadership', 'mba'],
        views: 430, downloads: 160, saves: 42, isApproved: true,
      },
      {
        title: 'Financial Management - IIT Roorkee',
        description: 'Time value of money, capital budgeting, cost of capital and financial analysis.',
        type: 'video', subject: 'Financial Management', courseCode: 'MBA201',
        category: mgmt._id, uploadedBy: student._id,
        fileUrl: 'https://nptel.ac.in/courses/110/105/110105085/',
        fileFormat: 'web', year: 2024, professor: 'Prof. Anil K. Sharma (IIT Roorkee)',
        tags: ['finance', 'capital budgeting', 'financial management', 'mba'],
        views: 380, downloads: 140, saves: 38, isApproved: true,
      },

      // CIVIL
      {
        title: 'Structural Analysis - IIT Kharagpur Complete',
        description: 'Beams, trusses, frames, influence lines, matrix methods and structural dynamics.',
        type: 'video', subject: 'Structural Analysis', courseCode: 'CIVIL301',
        category: civil._id, uploadedBy: admin._id,
        fileUrl: 'https://nptel.ac.in/courses/105/105/105105166/',
        fileFormat: 'web', year: 2024, professor: 'Prof. Amit Shaw (IIT Kharagpur)',
        tags: ['structural analysis', 'beams', 'trusses', 'civil engineering'],
        views: 320, downloads: 125, saves: 28, isApproved: true,
      },

      // LIFE SCIENCES
      {
        title: 'Biotechnology - Principles & Applications NPTEL',
        description: 'Genetic engineering, recombinant DNA, fermentation, bioreactors and bioprocessing.',
        type: 'video', subject: 'Biotechnology', courseCode: 'BIO301',
        category: life._id, uploadedBy: student._id,
        fileUrl: 'https://nptel.ac.in/courses/102/103/102103012/',
        fileFormat: 'web', year: 2024, professor: 'Prof. S. Mukhopadhyay (IIT Kharagpur)',
        tags: ['biotechnology', 'genetic engineering', 'dna', 'fermentation'],
        views: 290, downloads: 110, saves: 25, isApproved: true,
      },
    ];

    const createdResources = await Resource.insertMany(resources);
    console.log('Created ' + createdResources.length + ' real resources');

    await Category.findByIdAndUpdate(cs._id,    { resourceCount: 8 });
    await Category.findByIdAndUpdate(math._id,  { resourceCount: 3 });
    await Category.findByIdAndUpdate(ece._id,   { resourceCount: 3 });
    await Category.findByIdAndUpdate(mech._id,  { resourceCount: 2 });
    await Category.findByIdAndUpdate(sci._id,   { resourceCount: 2 });
    await Category.findByIdAndUpdate(mgmt._id,  { resourceCount: 2 });
    await Category.findByIdAndUpdate(civil._id, { resourceCount: 1 });
    await Category.findByIdAndUpdate(life._id,  { resourceCount: 1 });

    console.log('\nDatabase seeded with REAL resources!');
    console.log('Admin login:   admin@pettava.com  / admin123');
    console.log('Student login: rahul@college.edu  / student123');

    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seed();
