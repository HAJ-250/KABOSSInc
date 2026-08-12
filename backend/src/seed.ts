import bcrypt from 'bcryptjs';
import { initDatabase } from './config/database.js';
import User from './models/User.js';
import Service from './models/Service.js';
import Partner from './models/Partner.js';
import Testimonial from './models/Testimonial.js';
import FAQ from './models/FAQ.js';
import Announcement from './models/Announcement.js';
import Settings from './models/Settings.js';

async function seed() {
  console.log('Connecting to database...');
  await initDatabase();


  console.log('Seeding data...');

  const existingAdmin = await User.findOne({ where: { username: 'kabossInc' } });
  // Also guard by unique email so repeated runs don't crash with ER_DUP_ENTRY.
  const existingAdminByEmail = await User.findOne({ where: { email: 'admin@kabossinc.com' } });

  const desiredAdmin = {
    username: 'kabossInc',
    email: 'admin@kabossinc.com',
    passwordHash: await bcrypt.hash('kaboss123!', 10),
    displayName: 'Super Admin',
    role: 'admin' as const,
    emailVerified: true,
  };

  if (!existingAdmin && !existingAdminByEmail) {
    await User.create({
      username: desiredAdmin.username,
      email: desiredAdmin.email,
      password: desiredAdmin.passwordHash,
      displayName: desiredAdmin.displayName,
      role: desiredAdmin.role,
      emailVerified: desiredAdmin.emailVerified,
    });
    console.log('  Created admin: kabossInc');
  } else {
    const adminToUpdate = existingAdmin ?? existingAdminByEmail;
    adminToUpdate!.password = desiredAdmin.passwordHash;
    adminToUpdate!.displayName = desiredAdmin.displayName;
    adminToUpdate!.role = desiredAdmin.role;
    adminToUpdate!.emailVerified = desiredAdmin.emailVerified;
    await adminToUpdate!.save();
    console.log('  Updated admin password');
  }



  const services = [
    { title: 'Wedding Invitations', category: 'printing', description: 'Beautiful custom wedding invitation printing' },
    { title: 'Business Cards', category: 'printing', description: 'Professional business card printing' },
    { title: 'Logo Design', category: 'graphic-design', description: 'Custom logo design for your brand' },
    { title: 'Passport Photos', category: 'photography', description: 'Professional passport photo service' },
    { title: 'Sound System Rental', category: 'sound-system', description: 'Complete sound system for events' },
  ];
  for (const s of services) {
    const existing = await Service.findOne({ where: { title: s.title } });
    if (!existing) {
      await Service.create(s);
      console.log(`  Added service: ${s.title}`);
    }
  }

  const partners = [
    { name: 'Bank of Kigali', description: 'Leading commercial bank in Rwanda', logo: 'BK', sortOrder: 1 },
    { name: 'Equity Bank Rwanda', description: 'Pan-African banking group', logo: 'EB', sortOrder: 2 },
    { name: 'Rwanda Revenue Authority', description: 'Tax administration in Rwanda', logo: 'RRA', sortOrder: 3 },
    { name: 'MTN Rwanda', description: 'Leading telecommunications company', logo: 'MTN', sortOrder: 4 },
  ];
  for (const p of partners) {
    const existing = await Partner.findOne({ where: { name: p.name } });
    if (!existing) {
      await Partner.create(p);
      console.log(`  Added partner: ${p.name}`);
    }
  }

  const testimonials = [
    { name: 'Jean Pierre', role: 'Business Owner', content: 'KABOSS Inc delivered exceptional printing services. Highly recommended!', rating: 5 },
    { name: 'Alice Uwimana', role: 'Event Planner', content: 'Their sound system service made our wedding perfect!', rating: 5 },
    { name: 'David Mugisha', role: 'Graduate', content: 'Best graphic design services in Nyamasheke!', rating: 5 },
  ];
  for (const t of testimonials) {
    const existing = await Testimonial.findOne({ where: { name: t.name } });
    if (!existing) {
      await Testimonial.create(t);
      console.log(`  Added testimonial: ${t.name}`);
    }
  }

  const faqs = [
    { question: 'What services do you offer?', answer: 'We offer printing, graphic design, photography, sound system, digital services, and Irembo assistance.', category: 'general', sortOrder: 1 },
    { question: 'Where are you located?', answer: 'Nyamasheke District, Ruharambuga Sector, Ntendezi Cell, Kakiru Village, Rwanda.', category: 'general', sortOrder: 2 },
    { question: 'What are your business hours?', answer: 'Monday to Saturday: 8:00 AM - 6:00 PM, Sunday: 9:00 AM - 2:00 PM.', category: 'general', sortOrder: 3 },
  ];
  for (const f of faqs) {
    const existing = await FAQ.findOne({ where: { question: f.question } });
    if (!existing) {
      await FAQ.create(f);
      console.log(`  Added FAQ: ${f.question.substring(0, 50)}...`);
    }
  }

  const announcements = [
    { title: 'Welcome to KABOSS Inc', content: 'We are excited to serve you with our premium multi-services.', type: 'update' },
    { title: 'Holiday Promotion', content: '20% off on all printing services this holiday season!', type: 'promotion' },
  ];
  for (const a of announcements) {
    const existing = await Announcement.findOne({ where: { title: a.title } });
    if (!existing) {
      await Announcement.create(a);
      console.log(`  Added announcement: ${a.title}`);
    }
  }

  const existingSettings = await Settings.findOne({ where: { key: 'general' } });
  if (!existingSettings) {
    await Settings.create({
      key: 'general',
      value: JSON.stringify({

        heroTitle: 'Your Trusted Multi-Service Business Center',
        heroSubtitle: 'From printing to photography, we bring your ideas to life.',
        mission: 'To provide accessible, high-quality business services that empower our community.',
        vision: 'To be the leading multi-service business center in Rwanda.',
        coreValues: ['Integrity', 'Excellence', 'Innovation', 'Customer Focus'],
        businessHours: { monday: '8:00 AM - 6:00 PM', tuesday: '8:00 AM - 6:00 PM', wednesday: '8:00 AM - 6:00 PM', thursday: '8:00 AM - 6:00 PM', friday: '8:00 AM - 6:00 PM', saturday: '8:00 AM - 6:00 PM', sunday: '9:00 AM - 2:00 PM' },
        contact: { phone: '+250 788 882 296', email: 'kabbossimage@gmail.com', whatsapp: '+250 788 882 296', address: 'Nyamasheke District, Ruharambuga Sector, Ntendezi Cell, Kakiru Village, Rwanda' },
        socialMedia: { facebook: 'https://www.facebook.com/search/top?q=Kaboss%20Image', instagram: '#', whatsapp: 'https://wa.me/250788882296' },
        seo: { title: 'KABOSS Inc - Multi-Service Business Center', description: 'Premium printing, design, photography & digital services in Nyamasheke, Rwanda.', keywords: 'KABOSS, printing, graphic design, photography, sound system, Rwanda, Nyamasheke' },
      }),
    });
    console.log('  Set site settings');
  }

  console.log('Seed complete!');
}

const isMain = process.argv[1]?.includes('seed');
if (isMain) {
  seed().then(() => process.exit(0)).catch((err) => { console.error('Seed failed:', err); process.exit(1); });
}

export default seed;
