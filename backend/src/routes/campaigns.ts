import { Router, Response } from 'express';
import { prisma } from '../index';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, requireRole('ORGANIZER', 'ADMIN', 'GOVERNANCE'), async (_req: AuthRequest, res: Response) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      include: {
        event: { select: { id: true, title: true, startDate: true } },
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: { scheduledAt: 'desc' },
    });
    return res.json(campaigns);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticate, requireRole('ORGANIZER', 'ADMIN', 'GOVERNANCE'), async (req: AuthRequest, res: Response) => {
  try {
    const { eventId, channel, targetGroup, message, scheduledAt } = req.body;
    const campaign = await prisma.campaign.create({
      data: {
        eventId,
        createdById: req.user!.userId,
        channel,
        targetGroup,
        message,
        scheduledAt: new Date(scheduledAt),
      },
      include: {
        event: { select: { id: true, title: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: 'CREATE_CAMPAIGN',
        resource: `campaign:${campaign.id}`,
        details: `Campaign for ${campaign.event.title} on ${channel}`,
      },
    });

    return res.status(201).json(campaign);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/:id/send', authenticate, requireRole('ORGANIZER', 'ADMIN', 'GOVERNANCE'), async (req: AuthRequest, res: Response) => {
  try {
    const campaign = await prisma.campaign.update({
      where: { id: req.params.id },
      data: { status: 'SENT', sentAt: new Date() },
      include: { event: { select: { title: true } } },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: 'SEND_CAMPAIGN',
        resource: `campaign:${campaign.id}`,
        details: `Sent campaign for ${campaign.event.title}`,
      },
    });

    return res.json(campaign);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
