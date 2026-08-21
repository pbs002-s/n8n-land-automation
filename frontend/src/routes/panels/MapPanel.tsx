import type { Parcel } from '../../lib/types';
import ParcelPlate from '../../components/ParcelPlate';
import { DataRow, Panel, StatusMark } from '../../components/ui';
import { Reveal } from '../../components/motion';
import { decimals } from '../../lib/format';

const CORNERS = [
  ['NW', '23.8432', '90.2581'],
  ['NE', '23.8435', '90.2592'],
  ['SE', '23.8427', '90.2595'],
  ['SW', '23.8424', '90.2583'],
];

const LAYERS = [
  { bn: 'আরএস মৌজা নকশা', en: 'RS mouza sheet', meta: '1988 · sheet 04', tone: 'state' as const, mark: 'Matched' },
  { bn: 'বিএস জরিপ', en: 'BS survey, digitised', meta: '2015 · vector', tone: 'state' as const, mark: 'Matched' },
  { bn: 'ডিএলআরএস ভেক্টর', en: 'DLRS vector layer', meta: 'PostGIS · EPSG:4326', tone: 'indigo' as const, mark: 'Current' },
  { bn: 'সিএস নকশা', en: 'CS sheet, legacy', meta: '1940 · scanned', tone: 'amber' as const, mark: 'Edge gap' },
];

export default function MapPanel({ parcel }: { parcel: Parcel }) {
  const gap =
    parcel.mappedAreaDecimal !== undefined
      ? Math.abs(parcel.mappedAreaDecimal - parcel.areaDecimal)
      : 0;

  return (
    <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
      <Reveal>
        <Panel label="Boundary" meta={`মৌজা ${parcel.mouza} · দাগ ${parcel.dagNo}`}>
          <div className="graticule -mx-1 border border-line-hair bg-sheet-raised px-2 py-2">
            <ParcelPlate
              dagNo={parcel.dagNo.split(/[\/ ]/)[0]}
              areaDecimal={parcel.areaDecimal}
              landClass={parcel.landClass}
              mouza={parcel.mouza}
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-4">
            {CORNERS.map(([label, lat, lng]) => (
              <div key={label} className="bg-sheet px-3 py-2.5">
                <span className="mono block text-2xs uppercase text-ink-3">{label} corner</span>
                <span className="mono tnum mt-1 block text-xs text-ink">
                  {lat}, {lng}
                </span>
              </div>
            ))}
          </div>

          <p className="mt-3 text-xs text-ink-3">
            Coordinates come from the digitised survey layer. A boundary drawn here is a record of a survey,
            not a decision about where the legal boundary lies.
          </p>
        </Panel>
      </Reveal>

      <div className="space-y-5">
        <Reveal delay={80}>
          <Panel label="Survey layers" bodyClassName="px-0 py-0">
            <ul>
              {LAYERS.map((l) => (
                <li
                  key={l.en}
                  className="flex items-center justify-between gap-3 border-b border-line-hair px-5 py-3 last:border-0"
                >
                  <span>
                    <span className="bn block text-sm text-ink">{l.bn}</span>
                    <span className="block text-xs text-ink-3">
                      {l.en} · <span className="mono">{l.meta}</span>
                    </span>
                  </span>
                  <StatusMark tone={l.tone}>{l.mark}</StatusMark>
                </li>
              ))}
            </ul>
          </Panel>
        </Reveal>

        <Reveal delay={120}>
          <Panel label="Area check">
            <DataRow label="Recorded in খতিয়ান" value={decimals(parcel.areaDecimal)} mono />
            <DataRow label="Measured on the map" value={decimals(parcel.mappedAreaDecimal)} mono />
            <DataRow
              label="Difference"
              value={
                <span className={gap > 0.05 ? 'text-amber' : 'text-state'}>
                  {gap === 0 ? 'none' : `${gap.toFixed(2)} decimal`}
                </span>
              }
              mono
            />
            <p className="mt-3 text-xs text-ink-3">
              A difference between recorded and mapped area is a reason to look, not a finding. Survey
              methods and dates differ across sheets.
            </p>
          </Panel>
        </Reveal>
      </div>
    </div>
  );
}
