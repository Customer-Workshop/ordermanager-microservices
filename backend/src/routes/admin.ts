import { Router, Response } from 'express';
import { prisma } from '../index';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/config', authenticate, requireRole('ADMIN'), async (_req: AuthRequest, res: Response) => {
  try {
    const configs = await prisma.appConfig.findMany({ orderBy: { key: 'asc' } });
    return res.json(configs);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/config', authenticate, requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { key, value } = req.body;
    const config = await prisma.appConfig.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: 'UPDATE_CONFIG',
        resource: `config:${key}`,
        details: `Set ${key} = ${value}`,
      },
    });

    return res.json(config);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/audit-logs', authenticate, requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '50', action, userId } = req.query;
    const where: Record<string, unknown> = {};
    if (action) where.action = action as string;
    if (userId) where.userId = userId as string;

    const total = await prisma.auditLog.count({ where });
    const logs = await prisma.auditLog.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (parseInt(page as string) - 1) * parseInt(limit as string),
      take: parseInt(limit as string),
    });
    return res.json({ logs, total, page: parseInt(page as string), limit: parseInt(limit as string) });
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/access-grants', authenticate, requireRole('ADMIN'), async (_req: AuthRequest, res: Response) => {
  try {
    const grants = await prisma.accessGrant.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        group: { select: { id: true, name: true, type: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(grants);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/access-grants', authenticate, requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { userId, groupId, role } = req.body;
    const grant = await prisma.accessGrant.create({
      data: { userId, groupId, role },
      include: {
        user: { select: { id: true, name: true } },
        group: { select: { id: true, name: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: 'CREATE_ACCESS_GRANT',
        resource: `access:${grant.id}`,
        details: `Granted ${role} access to ${grant.user.name} for ${grant.group.name}`,
      },
    });

    return res.status(201).json(grant);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/access-grants/:id', authenticate, requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    await prisma.accessGrant.delete({ where: { id: req.params.id } });
    return res.json({ message: 'Access grant removed' });
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/stats', authenticate, requireRole('ADMIN'), async (_req: AuthRequest, res: Response) => {
  try {
    const [totalUsers, totalEvents, totalRegistrations, pendingEvents, totalCampaigns] = await Promise.all([
      prisma.user.count(),
      prisma.event.count(),
      prisma.registration.count(),
      prisma.event.count({ where: { status: 'PROPOSED' } }),
      prisma.campaign.count(),
    ]);
    return res.json({ totalUsers, totalEvents, totalRegistrations, pendingEvents, totalCampaigns });
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
