import { useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import type { Parcel } from '../../lib/types';
import { runReconciliation, type AuditCheck } from '../../lib/api';
import { Button, Panel, StatusMark } from '../../components/ui';
import { Reveal } from '../../components/motion';
import { shortDate } from '../../lib/format';

const SEVERITY_TONE = { HIGH: 'seal', MEDIUM: 'amber', LOW: 'indigo' } as const;

export default function ChecksPanel({ parcel }: { parcel: Parcel }) {
  const [checks, setChecks] = useState<AuditCheck[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [ranAt, setRanAt] = useState<string | null>(null);
  const flags = parcel.discrepancies ?? [];

  const run = async () => {
    setBusy(true);
    const res = await runReconciliation(parcel.id);
    setChecks(res.checks);
    setRanAt(new Date().toISOString());
    setBusy(false);
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
      <div className="space-y-5">
        <Reveal>
          <Panel
            label="Cross-source check"
            meta={ranAt ? `run ${new Date(ranAt).toLocaleTimeString('en-GB')}` : 'not run yet'}
            action={
              <Button size="sm" onClick={run} disabled={busy}>
                {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                {busy ? 'Checking' : 'Run check'}
              </Button>
            }
          >
            <p className="text-sm text-ink-2">
              Compares what the খতিয়ান, the holding register, the survey layer and the tax account each say
              about this parcel, and reports where they disagree.
            </p>

            {!checks && !busy && (
              <p className="mt-4 border border-line bg-ground-sunk px-4 py-6 text-center text-sm text-ink-3">
                No check has been run in this session.
              </p>
            )}

            {checks && (
              <ul className="mt-4">
                {checks.map((c, i) => (
                  <li
                    key={c.name}
                    className="anim-sheet-in flex items-start justify-between gap-4 border-b border-line-hair py-3 last:border-0"
                    style={{ animationDelay: `${i * 90}ms` }}
                  >
                    <span>
                      <span className="block text-sm text-ink">{c.name}</span>
                      <span className="mt-0.5 block text-sm text-ink-2">{c.detail}</span>
                    </span>
                    <StatusMark tone={c.status === 'PASS' ? 'state' : 'amber'}>
                      {c.status === 'PASS' ? 'Agrees' : 'Differs'}
                    </StatusMark>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </Reveal>

        <Reveal delay={80}>
          <div className="border-l-2 border-line-strong bg-sheet px-4 py-3.5">
            <p className="text-xs text-ink-3">
              A difference between two records is a reason to check, not a legal finding. Sources were
              surveyed in different decades with different methods, and disagreement is normal.
            </p>
          </div>
        </Reveal>
      </div>

      <Reveal delay={40}>
        <Panel label="Open flags" bodyClassName="px-0 py-0" meta={`${flags.length}`}>
          {flags.length === 0 ? (
            <p className="px-5 py-5 text-sm text-ink-3">Nothing flagged against this parcel.</p>
          ) : (
            <ul>
              {flags.map((d) => (
                <li key={d.id} className="border-b border-line-hair px-5 py-4 last:border-0">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm text-ink">{d.mismatchType}</p>
                    <StatusMark tone={SEVERITY_TONE[d.severity as keyof typeof SEVERITY_TONE] ?? 'neutral'}>
                      {d.severity}
                    </StatusMark>
                  </div>
                  <dl className="mt-3 space-y-1.5">
                    <div className="flex gap-3 text-xs">
                      <dt className="mono w-16 shrink-0 uppercase text-ink-3">Source A</dt>
                      <dd className="text-ink-2">{d.sourceA}</dd>
                    </div>
                    <div className="flex gap-3 text-xs">
                      <dt className="mono w-16 shrink-0 uppercase text-ink-3">Source B</dt>
                      <dd className="text-ink-2">{d.sourceB}</dd>
                    </div>
                  </dl>
                  <p className="mono mt-3 text-2xs uppercase text-ink-3">
                    {d.flaggedBy} · {shortDate(d.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </Reveal>
    </div>
  );
}
