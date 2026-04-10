import { Router, Response } from 'express';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';
import ical, { ICalCalendarMethod } from 'ical-generator';

const router = Router();

router.get('/event/:id/ical', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: {
        sessions: { orderBy: { sortOrder: 'asc' } },
        speaker: { select: { name: true, email: true } },
      },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const calendar = ical({
      name: 'EventHub',
      method: ICalCalendarMethod.REQUEST,
    });

    if (event.sessions.length > 0) {
      for (const session of event.sessions) {
        calendar.createEvent({
          start: session.startTime,
          end: session.endTime,
          summary: `${event.title} - ${session.topic}`,
          description: `${session.topicBrief}\n\nSpeaker: ${session.speakerName}${session.speakerTitle ? ` (${session.speakerTitle})` : ''}`,
          location: event.venue || undefined,
          url: event.bridgeLink || undefined,
          organizer: {
            name: event.speaker.name,
            email: event.speaker.email || 'noreply@eventhub.local',
          },
        });
      }
    } else {
      calendar.createEvent({
        start: event.startDate,
        end: event.endDate,
        summary: event.title,
        description: event.description,
        location: event.venue || undefined,
        url: event.bridgeLink || undefined,
        organizer: {
          name: event.speaker.name,
          email: event.speaker.email || 'noreply@eventhub.local',
        },
      });
    }

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${event.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics"`);
    return res.send(calendar.toString());
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/my-events/ical', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const registrations = await prisma.registration.findMany({
      where: { userId: req.user!.userId },
      include: {
        event: {
          include: {
            sessions: { orderBy: { sortOrder: 'asc' } },
            speaker: { select: { name: true, email: true } },
          },
        },
      },
    });

    const calendar = ical({
      name: 'EventHub - My Events',
      method: ICalCalendarMethod.PUBLISH,
    });

    for (const reg of registrations) {
      const event = reg.event;
      if (event.sessions.length > 0) {
        for (const session of event.sessions) {
          calendar.createEvent({
            start: session.startTime,
            end: session.endTime,
            summary: `${event.title} - ${session.topic}`,
            description: session.topicBrief,
            location: event.venue || undefined,
          });
        }
      } else {
        calendar.createEvent({
          start: event.startDate,
          end: event.endDate,
          summary: event.title,
          description: event.description,
          location: event.venue || undefined,
        });
      }
    }

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="eventhub-my-events.ics"');
    return res.send(calendar.toString());
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
