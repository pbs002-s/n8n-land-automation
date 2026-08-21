import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { Mutation, MutationStatus, Parcel } from '../../lib/types';
import { fileMutation } from '../../lib/api';
import { Button, Field, Panel, StatusMark, inputClass } from '../../components/ui';
import { Reveal } from '../../components/motion';
import Modal from '../../components/Modal';
import { cx, shortDate, taka } from '../../lib/format';

/* A নামজারি genuinely is a sequence, so it is numbered and drawn as one. */
const STAGES: Array<{ key: MutationStatus; en: string; bn: string }> = [
  { key: 'SUBMITTED', en: 'Filed', bn: 'আবেদন' },
  { key: 'KANUNGO_VERIFICATION', en: 'Field survey', bn: 'সরেজমিন' },
  { key: 'AC_LAND_HEARING', en: 'Hearing', bn: 'শুনানি' },
  { key: 'DCR_PAYMENT_PENDING', en: 'DCR payment', bn: 'ডিসিআর' },
];

const stageIndex = (status: MutationStatus) => {
  if (status === 'APPROVED') return STAGES.length;
  if (status === 'REJECTED') return -1;
  return STAGES.findIndex((s) => s.key === status);
};

function StageTrack({ status }: { status: MutationStatus }) {
  const idx = stageIndex(status);
  const rejected = status === 'REJECTED';

  return (
    <ol className="mt-4 grid grid-cols-4 gap-px border border-line bg-line">
      {STAGES.map((s, i) => {
        const done = !rejected && i < idx;
        const active = !rejected && i === idx;
        return (
          <li
            key={s.key}
            className={cx(
              'bg-sheet px-2.5 py-2.5',
              active && 'bg-indigo-soft',
              done && 'bg-state-soft'
            )}
          >
            <span
              className={cx(
                'mono block text-2xs',
                done ? 'text-state' : active ? 'text-indigo' : 'text-ink-3'
              )}
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className={cx('mt-1 block text-xs', active || done ? 'text-ink' : 'text-ink-3')}>{s.en}</span>
            <span className="bn block text-2xs text-ink-3">{s.bn}</span>
          </li>
        );
      })}
    </ol>
  );
}

export default function MutationsPanel({ parcel, onChanged }: { parcel: Parcel; onChanged: () => void }) {
  const mutations = parcel.mutations ?? [];
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [filed, setFiled] = useState<Mutation | null>(null);
  const [form, setForm] = useState({ applicantName: '', applicantNid: '', applicantPhone: '', proposedOwner: '' });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { mutation } = await fileMutation({ parcelId: parcel.id, ...form });
    setBusy(false);
    setOpen(false);
    setFiled(mutation);
    setForm({ applicantName: '', applicantNid: '', applicantPhone: '', proposedOwner: '' });
    onChanged();
  };

  return (
    <>
      <div className="space-y-5">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
            <div>
              <h2 className="sheet-title text-xl font-semibold text-ink">নামজারি</h2>
              <p className="mt-1 text-sm text-ink-2">
                Applications to change who is recorded as the owner of this parcel — including ones filed by
                other people.
              </p>
            </div>
            <Button variant="primary" onClick={() => setOpen(true)}>
              File a নামজারি
            </Button>
          </div>
        </Reveal>

        {mutations.length === 0 ? (
          <Reveal>
            <Panel label="No applications">
              <p className="text-sm text-ink">Nobody has applied to change this record.</p>
              <p className="mt-2 text-sm text-ink-2">
                If someone does, it appears here and you are told — before the hearing, not after.
              </p>
            </Panel>
          </Reveal>
        ) : (
          mutations.map((m, i) => (
            <Reveal key={m.id} delay={i * 70}>
              <Panel label={m.caseNumber} meta={shortDate(m.createdAt)}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-ink">
                      <span className="text-ink-3">From</span> {m.applicantName}{' '}
                      <span className="text-ink-3">to</span> {m.proposedOwner}
                    </p>
                    <p className="mt-1 text-sm text-ink-2">{m.currentStage}</p>
                  </div>
                  <StatusMark
                    tone={m.status === 'APPROVED' ? 'state' : m.status === 'REJECTED' ? 'seal' : 'amber'}
                  >
                    {m.status.replace(/_/g, ' ').toLowerCase()}
                  </StatusMark>
                </div>

                <StageTrack status={m.status} />

                <div className="mt-4 grid gap-x-8 gap-y-1 sm:grid-cols-2">
                  <p className="flex justify-between border-b border-line-hair py-2 text-sm">
                    <span className="text-ink-3">Hearing</span>
                    <span className="mono text-ink">{shortDate(m.hearingDate)}</span>
                  </p>
                  <p className="flex justify-between border-b border-line-hair py-2 text-sm">
                    <span className="text-ink-3">DCR fee</span>
                    <span className="mono text-ink">{taka(m.dcrAmount)}</span>
                  </p>
                </div>

                {m.remarks && <p className="mt-3 text-sm text-ink-2">{m.remarks}</p>}
              </Panel>
            </Reveal>
          ))
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} label={parcel.id} title="File a নামজারি" bn="নামজারির আবেদন">
        <form onSubmit={submit} className="space-y-4">
          <Field label="Applicant name" htmlFor="an">
            <input id="an" required value={form.applicantName} onChange={set('applicantName')} className={inputClass} />
          </Field>
          <Field label="Applicant NID" htmlFor="anid">
            <input
              id="anid"
              required
              inputMode="numeric"
              value={form.applicantNid}
              onChange={set('applicantNid')}
              className={`${inputClass} mono tnum`}
            />
          </Field>
          <Field label="Mobile number" htmlFor="aph" hint="Hearing notices are sent to this number.">
            <input
              id="aph"
              required
              inputMode="tel"
              value={form.applicantPhone}
              onChange={set('applicantPhone')}
              className={`${inputClass} mono tnum`}
            />
          </Field>
          <Field label="Record ownership to" htmlFor="po">
            <input id="po" required value={form.proposedOwner} onChange={set('proposedOwner')} className={inputClass} />
          </Field>

          <p className="border-l-2 border-line-strong bg-ground-sunk px-3 py-2 text-xs text-ink-3">
            The current recorded owner is told as soon as this is filed. DCR fee of {taka(1150)} is payable
            after the hearing, not now.
          </p>

          <div className="flex gap-2 pt-1">
            <Button type="button" className="flex-1" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" className="flex-1" disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {busy ? 'Filing' : 'File application'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!filed} onClose={() => setFiled(null)} label="Filed" title="Application received">
        {filed && (
          <div className="space-y-4">
            <p className="text-sm text-ink-2">Keep this case number. It is how you check the state later.</p>
            <p className="mono border border-line bg-ground-sunk px-4 py-3 text-lg text-ink">{filed.caseNumber}</p>
            <p className="text-sm text-ink-2">
              Next: the union land office assigns it for field survey. You will be told when a hearing date is
              set.
            </p>
            <Button variant="primary" className="w-full" onClick={() => setFiled(null)}>
              Done
            </Button>
          </div>
        )}
      </Modal>
    </>
  );
}
