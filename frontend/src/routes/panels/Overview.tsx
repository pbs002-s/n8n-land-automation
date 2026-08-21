import { FileText, ShieldCheck } from 'lucide-react';
import type { Parcel } from '../../lib/types';
import { DataRow, Panel, StatusMark } from '../../components/ui';
import { Reveal } from '../../components/motion';
import { decimals, maskNid, relativeDays, shortDate } from '../../lib/format';

const EVENT_TONE: Record<string, 'state' | 'amber' | 'seal' | 'indigo'> = {
  MUTATION_APPROVED: 'state',
  TAX_PAID: 'state',
  MUTATION_SUBMITTED: 'amber',
  ARREAR: 'seal',
  SURVEY: 'indigo',
};

export default function Overview({ parcel }: { parcel: Parcel }) {
  const events = parcel.timelineEvents ?? [];
  const docs = parcel.documents ?? [];

  return (
    <div className="grid gap-5 xl:grid-cols-[1.15fr_1fr]">
      <div className="space-y-5">
        <Reveal>
          <Panel label="Ownership" meta={parcel.khatianNo}>
            <DataRow label="Recorded owner" bn="মালিক" value={parcel.currentOwner} />
            <DataRow label="NID" value={maskNid(parcel.nidNumber)} mono />
            <DataRow label="Mobile" value={parcel.phone} mono />
            <DataRow label="Land class" bn="শ্রেণি" value={parcel.landClass} />
            <DataRow label="Holding" value={parcel.holdingNo} mono />
            <DataRow
              label="Recorded area"
              bn="জমির পরিমাণ"
              value={decimals(parcel.areaDecimal)}
              mono
            />
            {parcel.mappedAreaDecimal !== undefined && (
              <DataRow label="Mapped area" value={decimals(parcel.mappedAreaDecimal)} mono />
            )}
          </Panel>
        </Reveal>

        <Reveal delay={80}>
          <Panel label="Location" meta={`JL ${parcel.jlNumber}`}>
            <DataRow label="Division" value={parcel.division} />
            <DataRow label="District" bn="জেলা" value={parcel.district} />
            <DataRow label="Upazila" bn="উপজেলা" value={parcel.upazila} />
            <DataRow label="Mouza" bn="মৌজা" value={parcel.mouza} />
            <DataRow label="Dag" bn="দাগ" value={parcel.dagNo} mono />
          </Panel>
        </Reveal>
      </div>

      <div className="space-y-5">
        <Reveal delay={40}>
          <Panel label="History" meta={`${events.length} events`}>
            {events.length === 0 ? (
              <p className="text-sm text-ink-3">
                Nothing recorded against this parcel yet. Events appear here as offices act on it.
              </p>
            ) : (
              <ol className="relative space-y-0">
                {events.map((e, i) => (
                  <li key={e.id} className="relative flex gap-4 pb-5 last:pb-0">
                    {/* the spine: a survey chain down the left */}
                    <span className="flex flex-col items-center">
                      <span className="mt-1.5 h-2 w-2 shrink-0 border border-indigo bg-sheet" />
                      {i < events.length - 1 && <span className="mt-1 w-px flex-1 bg-line" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="text-sm font-medium text-ink">{e.title}</span>
                        <span className="mono text-2xs text-ink-3">
                          {shortDate(e.eventDate)} · {relativeDays(e.eventDate)}
                        </span>
                      </span>
                      <span className="mt-1 block text-sm text-ink-2">{e.description}</span>
                      <span className="mt-1.5 flex flex-wrap items-center gap-2">
                        <span className="mono text-2xs uppercase text-ink-3">{e.actor}</span>
                        {e.referenceDoc && (
                          <StatusMark tone={EVENT_TONE[e.eventType] ?? 'neutral'}>{e.referenceDoc}</StatusMark>
                        )}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </Panel>
        </Reveal>

        <Reveal delay={120}>
          <Panel label="Documents" bodyClassName="px-0 py-0" meta={`${docs.length} files`}>
            {docs.length === 0 ? (
              <p className="px-5 py-5 text-sm text-ink-3">No documents attached to this parcel.</p>
            ) : (
              <ul>
                {docs.map((d) => (
                  <li
                    key={d.id}
                    className="flex items-center justify-between gap-3 border-b border-line-hair px-5 py-3 last:border-0"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <FileText className="h-4 w-4 shrink-0 text-ink-3" />
                      <span className="min-w-0">
                        <span className="bn block text-sm text-ink">{d.docType}</span>
                        <span className="mono block truncate text-2xs text-ink-3">{d.fileName}</span>
                      </span>
                    </span>
                    <span className="mono shrink-0 text-2xs text-ink-3">{shortDate(d.uploadedAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </Reveal>

        <Reveal delay={160}>
          <div className="flex gap-3 border border-line bg-sheet px-4 py-3.5">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-ink-3" />
            <p className="text-xs text-ink-3">
              This summarises what government records currently say. It is not a title guarantee and does not
              replace legal due diligence or a fresh survey.
            </p>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
