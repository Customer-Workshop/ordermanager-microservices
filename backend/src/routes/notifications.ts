import { Router, Response } from 'express';
import { prisma } from '../index';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { sendSmsNotification } from '../services/twilio';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return res.json(notifications);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/unread-count', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const count = await prisma.notification.count({
      where: { userId: req.user!.userId, read: false },
    });
    return res.json({ count });
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/:id/read', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const notification = await prisma.notification.update({
      where: { id: req.params.id },
      data: { read: true },
    });
    return res.json(notification);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/read-all', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.userId, read: false },
      data: { read: true },
    });
    return res.json({ message: 'All notifications marked as read' });
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/send-event', authenticate, requireRole('ORGANIZER', 'ADMIN', 'GOVERNANCE'), async (req: AuthRequest, res: Response) => {
  try {
    const { eventId, message: customMessage } = req.body;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        registrations: { include: { user: true } },
        groups: {
          include: {
            group: { include: { members: { include: { user: true } } } },
          },
        },
      },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const userSet = new Set<string>();
    const usersToNotify: Array<{ id: string; name: string; phone: string | null; notifMechanism: string }> = [];

    for (const reg of event.registrations) {
      if (!userSet.has(reg.user.id)) {
        userSet.add(reg.user.id);
        usersToNotify.push({
          id: reg.user.id,
          name: reg.user.name,
          phone: reg.user.phone,
          notifMechanism: reg.user.notifMechanism,
        });
      }
    }

    for (const eg of event.groups) {
      for (const gm of eg.group.members) {
        if (!userSet.has(gm.user.id)) {
          userSet.add(gm.user.id);
          usersToNotify.push({
            id: gm.user.id,
            name: gm.user.name,
            phone: gm.user.phone,
            notifMechanism: gm.user.notifMechanism,
          });
        }
      }
    }

    const notifMessage = customMessage || `Reminder: "${event.title}" is coming up on ${event.startDate.toLocaleDateString()}`;

    const notifications = usersToNotify.map(u => ({
      userId: u.id,
      title: `Event: ${event.title}`,
      message: notifMessage,
      type: 'EVENT_REMINDER',
    }));

    await prisma.notification.createMany({ data: notifications });

    const smsUsers = usersToNotify.filter(u => u.notifMechanism === 'SMS' && u.phone);
    for (const u of smsUsers) {
      await sendSmsNotification(u.phone!, notifMessage);
    }

    return res.json({
      message: `Notifications sent to ${usersToNotify.length} users (${smsUsers.length} SMS)`,
    });
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
