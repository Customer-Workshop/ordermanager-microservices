import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@eventhub.com' },
    update: {},
    create: {
      email: 'admin@eventhub.com',
      passwordHash,
      name: 'Admin User',
      title: 'Platform Administrator',
      role: 'ADMIN',
      phone: '+1234567890',
    },
  });

  const organizer = await prisma.user.upsert({
    where: { email: 'organizer@eventhub.com' },
    update: {},
    create: {
      email: 'organizer@eventhub.com',
      passwordHash,
      name: 'Sarah Johnson',
      title: 'Event Manager',
      role: 'ORGANIZER',
      phone: '+1234567891',
    },
  });

  const governance = await prisma.user.upsert({
    where: { email: 'governance@eventhub.com' },
    update: {},
    create: {
      email: 'governance@eventhub.com',
      passwordHash,
      name: 'Michael Chen',
      title: 'HR Lead',
      role: 'GOVERNANCE',
      phone: '+1234567892',
    },
  });

  const speaker1 = await prisma.user.upsert({
    where: { email: 'speaker1@eventhub.com' },
    update: {},
    create: {
      email: 'speaker1@eventhub.com',
      passwordHash,
      name: 'Dr. Priya Sharma',
      title: 'Principal Architect',
      role: 'SPEAKER',
      linkedIn: 'https://linkedin.com/in/priyasharma',
      phone: '+1234567893',
    },
  });

  const speaker2 = await prisma.user.upsert({
    where: { email: 'speaker2@eventhub.com' },
    update: {},
    create: {
      email: 'speaker2@eventhub.com',
      passwordHash,
      name: 'Rajesh Kumar',
      title: 'Tech Lead',
      role: 'SPEAKER',
      linkedIn: 'https://linkedin.com/in/rajeshkumar',
      phone: '+1234567894',
    },
  });

  const audience1 = await prisma.user.upsert({
    where: { email: 'user1@eventhub.com' },
    update: {},
    create: {
      email: 'user1@eventhub.com',
      passwordHash,
      name: 'Alex Thompson',
      title: 'Software Developer',
      role: 'AUDIENCE',
      preferredTypes: 'TECHNOLOGY,DOMAIN',
      notifMechanism: 'EMAIL',
    },
  });

  const audience2 = await prisma.user.upsert({
    where: { email: 'user2@eventhub.com' },
    update: {},
    create: {
      email: 'user2@eventhub.com',
      passwordHash,
      name: 'Emily Davis',
      title: 'Product Designer',
      role: 'AUDIENCE',
      preferredTypes: 'HEALTH,FUN',
      notifMechanism: 'SMS',
      phone: '+1234567896',
    },
  });

  // Create organizational groups
  const techGroup = await prisma.orgGroup.upsert({
    where: { name: 'Technology Unit' },
    update: {},
    create: { name: 'Technology Unit', type: 'UNIT' },
  });

  const healthGroup = await prisma.orgGroup.upsert({
    where: { name: 'Health & Wellness' },
    update: {},
    create: { name: 'Health & Wellness', type: 'INTEREST' },
  });

  const bangaloreGroup = await prisma.orgGroup.upsert({
    where: { name: 'Bangalore Office' },
    update: {},
    create: { name: 'Bangalore Office', type: 'LOCATION' },
  });

  const funGroup = await prisma.orgGroup.upsert({
    where: { name: 'Fun & Recreation' },
    update: {},
    create: { name: 'Fun & Recreation', type: 'INTEREST' },
  });

  const domainGroup = await prisma.orgGroup.upsert({
    where: { name: 'Domain Excellence' },
    update: {},
    create: { name: 'Domain Excellence', type: 'UNIT' },
  });

  // Add group memberships
  const memberships = [
    { userId: admin.id, groupId: techGroup.id },
    { userId: organizer.id, groupId: techGroup.id },
    { userId: speaker1.id, groupId: techGroup.id },
    { userId: speaker2.id, groupId: techGroup.id },
    { userId: audience1.id, groupId: techGroup.id },
    { userId: audience2.id, groupId: healthGroup.id },
    { userId: governance.id, groupId: bangaloreGroup.id },
    { userId: audience1.id, groupId: bangaloreGroup.id },
    { userId: audience2.id, groupId: bangaloreGroup.id },
  ];

  for (const m of memberships) {
    await prisma.groupMembership.upsert({
      where: { userId_groupId: { userId: m.userId, groupId: m.groupId } },
      update: {},
      create: { ...m, role: 'MEMBER' },
    });
  }

  // Create sample events
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const in2Weeks = new Date(now);
  in2Weeks.setDate(in2Weeks.getDate() + 14);

  const event1 = await prisma.event.create({
    data: {
      title: 'Cloud Native Architecture Workshop',
      description: 'Deep dive into cloud-native patterns, microservices, and Kubernetes orchestration. Learn best practices for building scalable distributed systems.',
      eventType: 'TECHNOLOGY',
      status: 'APPROVED',
      startDate: tomorrow,
      endDate: new Date(tomorrow.getTime() + 3 * 60 * 60 * 1000),
      venue: 'Conference Room A, Building 1',
      bridgeLink: 'https://teams.microsoft.com/l/meetup/cloud-native',
      speakerId: speaker1.id,
      organizerId: organizer.id,
      sessions: {
        create: [
          {
            topic: 'Microservices Design Patterns',
            topicBrief: 'Explore the key design patterns for building resilient microservices including Circuit Breaker, Saga, and CQRS patterns.',
            startTime: tomorrow,
            endTime: new Date(tomorrow.getTime() + 90 * 60 * 1000),
            speakerName: 'Dr. Priya Sharma',
            speakerTitle: 'Principal Architect',
            speakerLinkedIn: 'https://linkedin.com/in/priyasharma',
            sortOrder: 0,
          },
          {
            topic: 'Kubernetes in Production',
            topicBrief: 'Best practices for running Kubernetes in production environments including monitoring, scaling, and security considerations.',
            startTime: new Date(tomorrow.getTime() + 105 * 60 * 1000),
            endTime: new Date(tomorrow.getTime() + 180 * 60 * 1000),
            speakerName: 'Rajesh Kumar',
            speakerTitle: 'Tech Lead',
            sortOrder: 1,
          },
        ],
      },
      groups: {
        create: [
          { groupId: techGroup.id },
        ],
      },
    },
  });

  const event2 = await prisma.event.create({
    data: {
      title: 'Yoga & Mindfulness Session',
      description: 'Weekly wellness session combining yoga practice with mindfulness techniques to help reduce stress and improve focus.',
      eventType: 'HEALTH',
      status: 'APPROVED',
      startDate: nextWeek,
      endDate: new Date(nextWeek.getTime() + 60 * 60 * 1000),
      venue: 'Wellness Center, Building 3',
      speakerId: audience2.id,
      organizerId: organizer.id,
      sessions: {
        create: [{
          topic: 'Morning Yoga Flow',
          topicBrief: 'A gentle yoga session suitable for all levels, focusing on breathing and stretching.',
          startTime: nextWeek,
          endTime: new Date(nextWeek.getTime() + 60 * 60 * 1000),
          speakerName: 'Emily Davis',
          speakerTitle: 'Certified Yoga Instructor',
          sortOrder: 0,
        }],
      },
      groups: {
        create: [
          { groupId: healthGroup.id },
          { groupId: bangaloreGroup.id },
        ],
      },
    },
  });

  const event3 = await prisma.event.create({
    data: {
      title: 'AI/ML Innovation Showcase',
      description: 'Showcase of cutting-edge AI and Machine Learning projects from across the organization. Featuring live demos and interactive Q&A sessions.',
      eventType: 'TECHNOLOGY',
      status: 'APPROVED',
      startDate: in2Weeks,
      endDate: new Date(in2Weeks.getTime() + 4 * 60 * 60 * 1000),
      venue: 'Auditorium, Main Campus',
      bridgeLink: 'https://teams.microsoft.com/l/meetup/ai-showcase',
      speakerId: speaker2.id,
      organizerId: organizer.id,
      sessions: {
        create: [
          {
            topic: 'Generative AI in Enterprise',
            topicBrief: 'How enterprises are leveraging generative AI for productivity, code generation, and customer experience.',
            startTime: in2Weeks,
            endTime: new Date(in2Weeks.getTime() + 90 * 60 * 1000),
            speakerName: 'Rajesh Kumar',
            speakerTitle: 'Tech Lead',
            sortOrder: 0,
          },
          {
            topic: 'ML Ops Best Practices',
            topicBrief: 'End-to-end ML pipeline management, model versioning, and deployment strategies.',
            startTime: new Date(in2Weeks.getTime() + 105 * 60 * 1000),
            endTime: new Date(in2Weeks.getTime() + 180 * 60 * 1000),
            speakerName: 'Dr. Priya Sharma',
            speakerTitle: 'Principal Architect',
            sortOrder: 1,
          },
        ],
      },
      groups: {
        create: [
          { groupId: techGroup.id },
          { groupId: domainGroup.id },
        ],
      },
    },
  });

  await prisma.event.create({
    data: {
      title: 'Annual Fun Day & Team Building',
      description: 'Annual fun day with games, team competitions, food stalls, and entertainment. Bring your family!',
      eventType: 'FUN',
      status: 'PROPOSED',
      startDate: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000),
      venue: 'Campus Grounds',
      speakerId: audience1.id,
      groups: {
        create: [
          { groupId: funGroup.id },
          { groupId: bangaloreGroup.id },
        ],
      },
    },
  });

  await prisma.event.create({
    data: {
      title: 'Domain Knowledge: Banking & Financial Services',
      description: 'Deep-dive into modern banking trends, digital transformation, and regulatory compliance in financial services.',
      eventType: 'DOMAIN',
      status: 'PROPOSED',
      startDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      venue: 'Virtual',
      bridgeLink: 'https://teams.microsoft.com/l/meetup/banking-domain',
      speakerId: speaker1.id,
      sessions: {
        create: [{
          topic: 'Digital Banking Trends 2026',
          topicBrief: 'Overview of key trends shaping the banking industry including open banking, embedded finance, and AI-driven risk management.',
          startTime: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
          endTime: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
          speakerName: 'Dr. Priya Sharma',
          speakerTitle: 'Principal Architect',
          sortOrder: 0,
        }],
      },
      groups: {
        create: [
          { groupId: domainGroup.id },
        ],
      },
    },
  });

  // Create registrations
  await prisma.registration.createMany({
    data: [
      { eventId: event1.id, userId: audience1.id },
      { eventId: event1.id, userId: audience2.id },
      { eventId: event1.id, userId: governance.id },
      { eventId: event2.id, userId: audience2.id },
      { eventId: event2.id, userId: audience1.id },
      { eventId: event3.id, userId: audience1.id },
      { eventId: event3.id, userId: speaker1.id },
    ],
  });

  // Create notifications
  await prisma.notification.createMany({
    data: [
      { userId: audience1.id, title: 'New Event', message: 'Cloud Native Architecture Workshop has been published!', type: 'EVENT_NEW' },
      { userId: audience1.id, title: 'Reminder', message: 'AI/ML Innovation Showcase is in 2 weeks', type: 'EVENT_REMINDER' },
      { userId: audience2.id, title: 'New Event', message: 'Yoga & Mindfulness Session is coming up next week', type: 'EVENT_NEW' },
      { userId: organizer.id, title: 'New Proposal', message: 'Annual Fun Day & Team Building needs your approval', type: 'EVENT_PROPOSAL' },
      { userId: organizer.id, title: 'New Proposal', message: 'Banking & Financial Services session proposed', type: 'EVENT_PROPOSAL' },
    ],
  });

  // Create app configs
  await prisma.appConfig.createMany({
    data: [
      { key: 'EVENT_TYPES', value: 'TECHNOLOGY,DOMAIN,HEALTH,FUN,PRODUCTS,OTHER' },
      { key: 'MAX_SESSIONS_PER_EVENT', value: '10' },
      { key: 'DEFAULT_NOTIFICATION_FREQUENCY', value: 'DAILY' },
      { key: 'CAMPAIGN_CHANNELS', value: 'MS_TEAMS,VIVA_ENGAGE,EMAIL,SMS' },
      { key: 'APP_NAME', value: 'EventHub' },
      { key: 'APP_VERSION', value: '1.0.0' },
    ],
  });

  console.log('Seed completed successfully!');
  console.log('Login credentials (password: password123):');
  console.log('  Admin: admin@eventhub.com');
  console.log('  Organizer: organizer@eventhub.com');
  console.log('  Governance: governance@eventhub.com');
  console.log('  Speaker: speaker1@eventhub.com / speaker2@eventhub.com');
  console.log('  Audience: user1@eventhub.com / user2@eventhub.com');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
