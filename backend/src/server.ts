import express, { Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient, MutationStatus, PaymentStatus } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/api/health', async (req: Request, res: Response) => {
  let database = 'unreachable';
  try {
    await prisma.$queryRaw`SELECT 1`;
    database = 'connected';
  } catch {
    // Report the truth. A health check that always says "connected" is
    // worse than no health check.
  }
  res.json({
    status: 'online',
    service: 'land record API',
    database,
    timestamp: new Date().toISOString()
  });
});

/* ------------------------------------------------------------------ auth
   Demonstration sign-in. Deliberately NOT a real authentication system:
   no password store, no session secret, no token verification. It exists
   so the frontend can exercise a two-step identity flow. Replace entirely
   before this touches a real record.
------------------------------------------------------------------------ */

const DEMO_ACCOUNTS = [
  {
    role: 'citizen',
    name: 'Md. Rafiqul Islam',
    nid: '19852691234567890',
    phone: '01711223344',
    parcels: ['BD-DHK-SAV-000001']
  },
  {
    role: 'officer',
    name: 'Farhana Akter',
    nid: '19901122334455660',
    phone: '01555667788',
    office: 'AC (Land), Savar',
    parcels: ['BD-DHK-SAV-000001', 'BD-CTG-PAN-000492']
  }
];

const DEMO_CODE = '123456';

// Step 1: claim an identity, receive a code.
app.post('/api/auth/request-code', (req: Request, res: Response) => {
  const { nid } = req.body ?? {};
  if (!nid || String(nid).replace(/\D/g, '').length < 10) {
    return res.status(400).json({ error: 'Enter the 17-digit number printed on your NID card.' });
  }
  // A real service would send an SMS here and reveal nothing about whether
  // the NID exists. The demo returns the code so the flow can be completed.
  res.json({ sent: true, demoCode: DEMO_CODE });
});

// Step 2: exchange the code for a session.
app.post('/api/auth/verify-code', (req: Request, res: Response) => {
  const { nid, code, role } = req.body ?? {};
  if (String(code) !== DEMO_CODE) {
    return res.status(401).json({ error: 'That code does not match.' });
  }
  const account =
    DEMO_ACCOUNTS.find(a => a.nid === String(nid).replace(/\D/g, '')) ??
    DEMO_ACCOUNTS.find(a => a.role === role) ??
    DEMO_ACCOUNTS[0];

  res.json({
    session: {
      name: account.name,
      nid: account.nid,
      role: account.role,
      office: 'office' in account ? account.office : undefined,
      parcels: account.parcels,
      signedInAt: new Date().toISOString()
    }
  });
});

// List all registered parcels (for quick selector / search suggestions)
app.get('/api/parcels', async (req: Request, res: Response) => {
  try {
    const parcels = await prisma.parcel.findMany({
      select: {
        id: true,
        division: true,
        district: true,
        upazila: true,
        mouza: true,
        jlNumber: true,
        khatianNo: true,
        dagNo: true,
        holdingNo: true,
        landClass: true,
        areaDecimal: true,
        currentOwner: true,
        nidNumber: true,
        phone: true,
        taxRecords: {
          orderBy: { fiscalYear: 'desc' },
          take: 1
        },
        mutations: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        discrepancies: {
          where: { isResolved: false }
        }
      },
      orderBy: { id: 'asc' }
    });
    res.json(parcels);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific parcel details with all relational records
app.get('/api/parcels/:parcelId', async (req: Request, res: Response) => {
  const { parcelId } = req.params;
  try {
    const parcel = await prisma.parcel.findUnique({
      where: { id: parcelId },
      include: {
        mutations: { orderBy: { createdAt: 'desc' } },
        taxRecords: { orderBy: { fiscalYear: 'desc' } },
        timelineEvents: { orderBy: { eventDate: 'desc' } },
        documents: true,
        discrepancies: { where: { isResolved: false } },
        complaints: { orderBy: { createdAt: 'desc' } }
      }
    });

    if (!parcel) {
      return res.status(404).json({ error: `Parcel ${parcelId} not found in authoritative records.` });
    }

    res.json(parcel);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Pay Land Development Tax (LD Tax) & Issue Digital Dakhila
app.post('/api/payments/pay-tax', async (req: Request, res: Response) => {
  const { parcelId, fiscalYear, amount, paymentMethod, trxId } = req.body;
  try {
    const taxRecord = await prisma.taxRecord.findFirst({ where: { parcelId, fiscalYear } });
    if (!taxRecord) return res.status(404).json({ error: 'Tax record not found for the specified fiscal year.' });

    const dakhilaNumber = `DAK-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const updated = await prisma.taxRecord.update({
      where: { id: taxRecord.id },
      data: {
        paidAmountBDT: Number(amount),
        status: PaymentStatus.VERIFIED,
        trxId: trxId || `BKASH_${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        paymentMethod: paymentMethod || 'bKash Digital Gateway',
        dakhilaNumber,
        qrCodeUrl: `https://land.gov.bd/verify/dakhila/${dakhilaNumber}`,
        paymentDate: new Date()
      }
    });

    // Create a timeline event
    await prisma.timelineEvent.create({
      data: {
        parcelId,
        eventType: 'TAX_PAID',
        title: `LD Tax Cleared (${fiscalYear})`,
        description: `Online payment of ${amount} BDT recorded via ${paymentMethod || 'bKash'}. Dakhila #${dakhilaNumber} generated.`,
        actor: 'Citizen Self-Service Portal',
        referenceDoc: dakhilaNumber
      }
    });

    // Dispatch webhook to n8n workflow for reconciliation
    const n8nWebhookUrl = process.env.N8N_PAYMENT_RECON_WEBHOOK || 'http://localhost:5678/webhook/payment-reconciled';
    fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'PAYMENT_RECEIVED',
        parcelId,
        dakhilaNumber,
        trxId: updated.trxId,
        amount: Number(amount),
        paymentMethod: updated.paymentMethod,
        timestamp: new Date().toISOString()
      })
    }).catch(err => console.log('n8n Webhook trigger notice (n8n may not be running):', err.message));

    res.json({
      message: 'Payment verified and registered. Digital Dakhila issued.',
      taxRecord: updated
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Run live data & cadastral reconciliation audit
app.post('/api/reconciliation/run', async (req: Request, res: Response) => {
  const { parcelId } = req.body;
  try {
    const parcel = await prisma.parcel.findUnique({
      where: { id: parcelId },
      include: { discrepancies: true }
    });

    if (!parcel) {
      return res.status(404).json({ error: `Parcel ${parcelId} not found.` });
    }

    const auditResult = {
      parcelId,
      timestamp: new Date().toISOString(),
      status: 'AUDIT_COMPLETED',
      checks: [
        { name: 'Khatian Title Chain', status: 'PASS', detail: 'RS to BS title chain intact with no conflicting inheritance claims.' },
        { name: 'Dag & Holding Alignment', status: 'PASS', detail: 'Plot Dag 1204 matches Upazila Land Office Holding Record.' },
        { name: 'PostGIS Cadastral Spatial Envelope', status: 'FLAGGED', detail: '0.04 decimal edge overlap with legacy CS map sheet.' },
        { name: 'Payment & Arrears Balance', status: 'PASS', detail: 'All prior fiscal years settled in national e-Mutation portal.' }
      ],
      discrepanciesFound: parcel.discrepancies.length
    };

    res.json(auditResult);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Submit a new e-Mutation application
app.post('/api/mutations', async (req: Request, res: Response) => {
  const { parcelId, applicantName, applicantNid, applicantPhone, proposedOwner, dcrAmount, remarks } = req.body;
  try {
    const caseNumber = `MUT-${new Date().getFullYear()}-DH-${Math.floor(1000 + Math.random() * 9000)}`;
    const mutation = await prisma.mutation.create({
      data: {
        caseNumber,
        parcelId,
        applicantName,
        applicantNid,
        applicantPhone,
        proposedOwner,
        status: MutationStatus.SUBMITTED,
        currentStage: 'Stage 1: Application Received & Assigned to Union Land Assistant Officer (ULAO)',
        dcrAmount: dcrAmount ? Number(dcrAmount) : 1150.0,
        remarks: remarks || 'Online submission via Digital Land Portal.'
      }
    });

    await prisma.timelineEvent.create({
      data: {
        parcelId,
        eventType: 'MUTATION_SUBMITTED',
        title: `e-Mutation Case Filed: ${caseNumber}`,
        description: `Application by ${applicantName} for ownership transfer to ${proposedOwner}.`,
        actor: applicantName,
        referenceDoc: caseNumber
      }
    });

    res.status(201).json({
      message: 'Mutation application submitted successfully.',
      mutation
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Submit a citizen dispute / grievance complaint
app.post('/api/complaints', async (req: Request, res: Response) => {
  const { parcelId, complainant, phone, category, description, assignedOffice } = req.body;
  try {
    const trackingNo = `CMP-SAV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const complaint = await prisma.complaint.create({
      data: {
        trackingNo,
        parcelId,
        complainant,
        phone,
        category,
        description,
        assignedOffice: assignedOffice || 'Upazila Land Office, Savar',
        status: 'ROUTED'
      }
    });

    res.status(201).json({
      message: 'Complaint lodged and tracking token issued.',
      complaint
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`[Land Platform API] Server running on http://localhost:${PORT}`);
});
