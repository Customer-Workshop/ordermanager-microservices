import { Router, Response } from 'express';
import { prisma } from '../index';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

const createEventSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  eventType: z.string().min(1),
  startDate: z.string(),
  endDate: z.string(),
  venue: z.string().optional(),
  bridgeLink: z.string().optional(),
  groupIds: z.array(z.string()).optional(),
  sessions: z.array(z.object({
    topic: z.string().min(1),
    topicBrief: z.string().min(1),
    startTime: z.string(),
    endTime: z.string(),
    speakerName: z.string().min(1),
    speakerTitle: z.string().optional(),
    speakerLinkedIn: z.string().optional(),
    speakerHeadshot: z.string().optional(),
  })).optional(),
});

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { type, status, from, to, search, view } = req.query;

    const where: Record<string, unknown> = {};

    if (type) where.eventType = type as string;
    if (status) {
      where.status = status as string;
    } else {
      where.status = 'APPROVED';
    }
    if (from || to) {
      where.startDate = {};
      if (from) (where.startDate as Record<string, unknown>).gte = new Date(from as string);
      if (to) (where.startDate as Record<string, unknown>).lte = new Date(to as string);
    }
    if (search) {
      where.OR = [
        { title: { contains: search as string } },
        { description: { contains: search as string } },
      ];
    }

    if (view === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      where.startDate = { gte: today, lt: tomorrow };
    } else if (view === 'week') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      where.startDate = { gte: today, lt: nextWeek };
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        speaker: { select: { id: true, name: true, title: true, headshotUrl: true } },
        organizer: { select: { id: true, name: true } },
        sessions: { orderBy: { sortOrder: 'asc' } },
        groups: { include: { group: true } },
        _count: { select: { registrations: true } },
      },
      orderBy: { startDate: 'asc' },
    });

    return res.json(events);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/my-events', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const events = await prisma.event.findMany({
      where: {
        OR: [
          { speakerId: req.user!.userId },
          { organizerId: req.user!.userId },
          { registrations: { some: { userId: req.user!.userId } } },
        ],
      },
      include: {
        speaker: { select: { id: true, name: true, title: true } },
        organizer: { select: { id: true, name: true } },
        sessions: { orderBy: { sortOrder: 'asc' } },
        groups: { include: { group: true } },
        _count: { select: { registrations: true } },
      },
      orderBy: { startDate: 'asc' },
    });
    return res.json(events);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/pending', authenticate, requireRole('ORGANIZER', 'ADMIN', 'GOVERNANCE'), async (_req: AuthRequest, res: Response) => {
  try {
    const events = await prisma.event.findMany({
      where: { status: 'PROPOSED' },
      include: {
        speaker: { select: { id: true, name: true, title: true, email: true } },
        sessions: { orderBy: { sortOrder: 'asc' } },
        groups: { include: { group: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(events);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: {
        speaker: { select: { id: true, name: true, title: true, linkedIn: true, headshotUrl: true } },
        organizer: { select: { id: true, name: true } },
        sessions: { orderBy: { sortOrder: 'asc' } },
        groups: { include: { group: true } },
        registrations: { include: { user: { select: { id: true, name: true, email: true } } } },
        _count: { select: { registrations: true } },
      },
    });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    return res.json(event);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const data = createEventSchema.parse(req.body);
    const event = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        eventType: data.eventType,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        venue: data.venue,
        bridgeLink: data.bridgeLink,
        speakerId: req.user!.userId,
        status: req.user!.role === 'ORGANIZER' || req.user!.role === 'ADMIN' ? 'APPROVED' : 'PROPOSED',
        sessions: data.sessions ? {
          create: data.sessions.map((s, i) => ({
            topic: s.topic,
            topicBrief: s.topicBrief,
            startTime: new Date(s.startTime),
            endTime: new Date(s.endTime),
            speakerName: s.speakerName,
            speakerTitle: s.speakerTitle,
            speakerLinkedIn: s.speakerLinkedIn,
            speakerHeadshot: s.speakerHeadshot,
            sortOrder: i,
          })),
        } : undefined,
        groups: data.groupIds ? {
          create: data.groupIds.map(gId => ({ groupId: gId })),
        } : undefined,
      },
      include: {
        sessions: true,
        groups: { include: { group: true } },
        speaker: { select: { id: true, name: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: 'CREATE_EVENT',
        resource: `event:${event.id}`,
        details: `Created event: ${event.title}`,
      },
    });

    return res.status(201).json(event);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/:id/approve', authenticate, requireRole('ORGANIZER', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const event = await prisma.event.update({
      where: { id: req.params.id },
      data: {
        status: 'APPROVED',
        organizerId: req.user!.userId,
      },
      include: { speaker: { select: { id: true, name: true, email: true } } },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: 'APPROVE_EVENT',
        resource: `event:${event.id}`,
        details: `Approved event: ${event.title}`,
      },
    });

    return res.json(event);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/:id/reject', authenticate, requireRole('ORGANIZER', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { reason } = req.body;
    const event = await prisma.event.update({
      where: { id: req.params.id },
      data: { status: 'REJECTED' },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: 'REJECT_EVENT',
        resource: `event:${event.id}`,
        details: `Rejected event: ${event.title}. Reason: ${reason || 'N/A'}`,
      },
    });

    return res.json(event);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/:id', authenticate, requireRole('ORGANIZER', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, eventType, startDate, endDate, venue, bridgeLink, status } = req.body;
    const updateData: Record<string, unknown> = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (eventType) updateData.eventType = eventType;
    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate) updateData.endDate = new Date(endDate);
    if (venue !== undefined) updateData.venue = venue;
    if (bridgeLink !== undefined) updateData.bridgeLink = bridgeLink;
    if (status) updateData.status = status;

    const event = await prisma.event.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        sessions: true,
        groups: { include: { group: true } },
        speaker: { select: { id: true, name: true } },
      },
    });
    return res.json(event);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:id/register', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const registration = await prisma.registration.create({
      data: {
        eventId: req.params.id,
        userId: req.user!.userId,
      },
    });
    return res.status(201).json(registration);
  } catch {
    return res.status(500).json({ error: 'Already registered or event not found' });
  }
});

router.delete('/:id/register', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.registration.deleteMany({
      where: {
        eventId: req.params.id,
        userId: req.user!.userId,
      },
    });
    return res.json({ message: 'Unregistered successfully' });
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
