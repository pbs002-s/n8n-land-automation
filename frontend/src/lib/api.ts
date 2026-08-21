import { demoParcels, findDemoParcel } from './demoData';
import type { Mutation, Parcel, Session, TaxRecord } from './types';

export type DataSource = 'live' | 'demo';

let source: DataSource = 'demo';
export const getSource = () => source;

const listeners = new Set<(s: DataSource) => void>();
export function onSourceChange(fn: (s: DataSource) => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
function setSource(next: DataSource) {
  if (next === source) return;
  source = next;
  listeners.forEach((fn) => fn(next));
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 3500);
  try {
    const res = await fetch(path, {
      ...init,
      signal: ctrl.signal,
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    });
    if (!res.ok) throw new Error(`${res.status}`);
    setSource('live');
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

/* ---------------------------------------------------------------- parcels */

export async function listParcels(): Promise<Parcel[]> {
  try {
    return await req<Parcel[]>('/api/parcels');
  } catch {
    setSource('demo');
    return demoParcels;
  }
}

export async function getParcel(id: string): Promise<Parcel | null> {
  try {
    return await req<Parcel>(`/api/parcels/${encodeURIComponent(id)}`);
  } catch {
    setSource('demo');
    return findDemoParcel(id) ?? null;
  }
}

/* ------------------------------------------------------------------- tax */

export async function payTax(input: {
  parcelId: string;
  fiscalYear: string;
  amount: number;
  paymentMethod: string;
}): Promise<{ taxRecord: TaxRecord }> {
  const trxId = `${input.paymentMethod.toUpperCase().replace(/\s+/g, '')}_${Math.floor(
    10_000_000 + Math.random() * 90_000_000
  )}`;
  try {
    return await req<{ taxRecord: TaxRecord }>('/api/payments/pay-tax', {
      method: 'POST',
      body: JSON.stringify({ ...input, trxId }),
    });
  } catch {
    setSource('demo');
    // Mirror the server's response shape so the UI path is identical.
    const parcel = findDemoParcel(input.parcelId);
    const record = parcel?.taxRecords?.find((t) => t.fiscalYear === input.fiscalYear);
    const dakhilaNumber = `DAK-${new Date().getFullYear()}-${Math.floor(100_000 + Math.random() * 900_000)}`;
    const taxRecord: TaxRecord = {
      ...(record ?? {
        id: 'demo',
        fiscalYear: input.fiscalYear,
        annualDemandBDT: input.amount,
        arrearAmountBDT: 0,
        totalDueBDT: input.amount,
      }),
      paidAmountBDT: input.amount,
      status: 'VERIFIED',
      trxId,
      paymentMethod: input.paymentMethod,
      dakhilaNumber,
      qrCodeUrl: `https://land.gov.bd/verify/dakhila/${dakhilaNumber}`,
      paymentDate: new Date().toISOString(),
    } as TaxRecord;
    if (record) Object.assign(record, taxRecord);
    return { taxRecord };
  }
}

/* -------------------------------------------------------------- mutation */

export async function fileMutation(input: {
  parcelId: string;
  applicantName: string;
  applicantNid: string;
  applicantPhone: string;
  proposedOwner: string;
}): Promise<{ mutation: Mutation }> {
  try {
    return await req<{ mutation: Mutation }>('/api/mutations', {
      method: 'POST',
      body: JSON.stringify({ ...input, dcrAmount: 1150 }),
    });
  } catch {
    setSource('demo');
    const mutation: Mutation = {
      id: `demo-${Date.now()}`,
      caseNumber: `MUT-${new Date().getFullYear()}-DH-${Math.floor(1000 + Math.random() * 9000)}`,
      applicantName: input.applicantName,
      applicantNid: input.applicantNid,
      applicantPhone: input.applicantPhone,
      proposedOwner: input.proposedOwner,
      status: 'SUBMITTED',
      currentStage: 'Received at the union land office',
      hearingDate: null,
      dcrAmount: 1150,
      remarks: 'Filed online.',
      createdAt: new Date().toISOString(),
    };
    const parcel = findDemoParcel(input.parcelId);
    parcel?.mutations?.unshift(mutation);
    return { mutation };
  }
}

/* ---------------------------------------------------------- reconciliation */

export interface AuditCheck {
  name: string;
  status: 'PASS' | 'FLAGGED';
  detail: string;
}

export async function runReconciliation(parcelId: string): Promise<{ checks: AuditCheck[] }> {
  try {
    return await req<{ checks: AuditCheck[] }>('/api/reconciliation/run', {
      method: 'POST',
      body: JSON.stringify({ parcelId }),
    });
  } catch {
    setSource('demo');
    await new Promise((r) => setTimeout(r, 900));
    const parcel = findDemoParcel(parcelId);
    const flagged = (parcel?.discrepancies ?? []).length > 0;
    return {
      checks: [
        { name: 'Ownership chain', status: 'PASS', detail: 'RS to BS records agree. No competing claim on file.' },
        { name: 'Dag and holding numbers', status: 'PASS', detail: 'Plot matches the upazila holding register.' },
        {
          name: 'Boundary geometry',
          status: flagged ? 'FLAGGED' : 'PASS',
          detail: flagged
            ? 'Mapped area differs from the recorded area. Worth checking, not a legal finding.'
            : 'Vector boundary matches the digitised sheet.',
        },
        { name: 'Tax and arrears', status: 'PASS', detail: 'No unexplained balance across fiscal years.' },
      ],
    };
  }
}

/* ---------------------------------------------------------------- session */

const SESSION_KEY = 'bhumi.session';

export function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function writeSession(session: Session | null) {
  try {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    /* storage blocked — session lives in memory for this tab only */
  }
}
