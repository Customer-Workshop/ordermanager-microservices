import { Router, Response } from 'express';
import { prisma } from '../index';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (_req: AuthRequest, res: Response) => {
  try {
    const groups = await prisma.orgGroup.findMany({
      include: {
        _count: { select: { members: true, events: true } },
        children: { select: { id: true, name: true, type: true } },
      },
      orderBy: { name: 'asc' },
    });
    return res.json(groups);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticate, requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, type, parentId } = req.body;
    const group = await prisma.orgGroup.create({
      data: { name, type, parentId },
    });
    return res.status(201).json(group);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:id/members', authenticate, requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { userId, role } = req.body;
    const membership = await prisma.groupMembership.create({
      data: {
        userId,
        groupId: req.params.id,
        role: role || 'MEMBER',
      },
    });
    return res.status(201).json(membership);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id/members', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const members = await prisma.groupMembership.findMany({
      where: { groupId: req.params.id },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });
    return res.json(members);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
