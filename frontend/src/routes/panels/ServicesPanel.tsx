import { Panel, StatusMark } from '../../components/ui';
import { Reveal } from '../../components/motion';

/**
 * Previously "Automation Hub", written from the system's side:
 * webhooks, cron, uptime percentages, port numbers. Rewritten to say what
 * each job does for the person whose land it is. The plumbing is at the
 * bottom, where an operator can find it and a citizen can ignore it.
 */
const JOBS = [
  {
    en: 'Tell you when someone touches your record',
    bn: 'রেকর্ডে পরিবর্তন হলে জানানো',
    detail: 'A message when a নামজারি, correction or charge is filed against your parcel.',
    when: 'As it happens',
    tone: 'state' as const,
  },
  {
    en: 'Match payments against the gateway',
    bn: 'পেমেন্ট মিলিয়ে দেখা',
    detail: 'Every tax payment is checked against bKash, Nagad, Rocket or the card processor, so a receipt is never issued twice.',
    when: 'Within minutes',
    tone: 'state' as const,
  },
  {
    en: 'Compare the record against the map',
    bn: 'রেকর্ড ও নকশা মেলানো',
    detail: 'Recorded area, dag numbers and the survey boundary are checked against each other, and differences are flagged.',
    when: 'Hourly',
    tone: 'indigo' as const,
  },
  {
    en: 'Move নামজারি cases along',
    bn: 'নামজারি অগ্রগতি',
    detail: 'Tracks the four stages and sends the hearing notice to everyone who must attend.',
    when: 'On each stage change',
    tone: 'indigo' as const,
  },
  {
    en: 'Remind you before the tax deadline',
    bn: 'কর পরিশোধের আগাম বার্তা',
    detail: 'A reminder before the Baishakh deadline, with the amount already worked out.',
    when: 'Seasonal',
    tone: 'amber' as const,
  },
  {
    en: 'Issue a receipt that can be checked',
    bn: 'যাচাইযোগ্য দাখিলা',
    detail: 'Each দাখিলা carries a reference that a third party can verify without calling an office.',
    when: 'On payment',
    tone: 'state' as const,
  },
];

export default function ServicesPanel() {
  return (
    <div className="space-y-5">
      <Reveal>
        <div className="border-b border-line pb-4">
          <h2 className="sheet-title text-xl font-semibold text-ink">What runs in the background</h2>
          <p className="mt-1 max-w-measure text-sm text-ink-2">
            Six jobs that do work you would otherwise have to do by visiting an office and asking.
          </p>
        </div>
      </Reveal>

      <div className="grid gap-px border border-line bg-line sm:grid-cols-2">
        {JOBS.map((j, i) => (
          <Reveal key={j.en} delay={i * 55} className="bg-sheet px-5 py-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-ink">{j.en}</p>
                <p className="bn mt-0.5 text-xs text-ink-3">{j.bn}</p>
              </div>
              <StatusMark tone={j.tone}>{j.when}</StatusMark>
            </div>
            <p className="mt-2.5 text-sm text-ink-2">{j.detail}</p>
          </Reveal>
        ))}
      </div>

      <Reveal delay={100}>
        <Panel label="Operator notes" meta="local development">
          <div className="grid gap-x-8 sm:grid-cols-2">
            {[
              ['API', 'express · :5000'],
              ['Database', 'postgres + postgis · :5433'],
              ['Workflow runner', 'n8n · :5678'],
              ['Payment webhook', '/webhook/payment-reconciled'],
            ].map(([k, v]) => (
              <p key={k} className="flex justify-between gap-4 border-b border-line-hair py-2 text-sm last:border-0">
                <span className="text-ink-3">{k}</span>
                <span className="mono text-xs text-ink">{v}</span>
              </p>
            ))}
          </div>
          <p className="mt-3 text-xs text-ink-3">
            When the API is unreachable the interface falls back to seeded data and says so in the header.
          </p>
        </Panel>
      </Reveal>
    </div>
  );
}
