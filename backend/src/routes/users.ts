import { Router, Response } from 'express';
import { prisma } from '../index';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, requireRole('ADMIN'), async (_req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        title: true,
        phone: true,
        createdAt: true,
      },
      orderBy: { name: 'asc' },
    });
    return res.json(users);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/preferences', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { notifFrequency, notifMechanism, preferredTypes } = req.body;
    const updateData: Record<string, string> = {};
    if (notifFrequency) updateData.notifFrequency = notifFrequency;
    if (notifMechanism) updateData.notifMechanism = notifMechanism;
    if (preferredTypes !== undefined) updateData.preferredTypes = preferredTypes;

    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        notifFrequency: true,
        notifMechanism: true,
        preferredTypes: true,
      },
    });
    return res.json(user);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, title, phone, linkedIn } = req.body;
    const updateData: Record<string, string> = {};
    if (name) updateData.name = name;
    if (title !== undefined) updateData.title = title;
    if (phone !== undefined) updateData.phone = phone;
    if (linkedIn !== undefined) updateData.linkedIn = linkedIn;

    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        title: true,
        phone: true,
        linkedIn: true,
        role: true,
      },
    });
    return res.json(user);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/:id/role', authenticate, requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { role } = req.body;
    const validRoles = ['ADMIN', 'ORGANIZER', 'GOVERNANCE', 'SPEAKER', 'AUDIENCE'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: { id: true, email: true, name: true, role: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: 'UPDATE_ROLE',
        resource: `user:${user.id}`,
        details: `Updated role to ${role} for ${user.name}`,
      },
    });

    return res.json(user);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
