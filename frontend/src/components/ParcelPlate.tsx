import React from 'react';
import { cx } from '../lib/format';

/**
 * ParcelPlate — the signature element.
 *
 * A hairline cadastral drawing of the parcel: the subject plot, its
 * neighbours, the access road, a north arrow, a scale bar. On load the
 * boundary draws itself and the corner nodes drop in, one at a time —
 * the sheet surveys itself.
 *
 * The same plate appears in three places (landing hero, the map panel,
 * the printed দাখিলা) so it reads as the product's mark, not decoration.
 */

interface Props {
  dagNo?: string;
  areaDecimal?: number;
  landClass?: string;
  mouza?: string;
  sheet?: string;
  animate?: boolean;
  className?: string;
  compact?: boolean;
}

const SUBJECT = '260,74 404,88 386,268 236,246';
const NODES: Array<[number, number]> = [
  [260, 74],
  [404, 88],
  [386, 268],
  [236, 246],
];

const drawStyle = (delay: number): React.CSSProperties =>
  ({ ['--len' as string]: 1, animationDelay: `${delay}ms` }) as React.CSSProperties;

export default function ParcelPlate({
  dagNo = '1204',
  areaDecimal = 5.5,
  landClass = 'Homestead',
  mouza = 'Tetuljhora',
  sheet = 'BS 2015 · sheet 04',
  animate = true,
  className,
  compact = false,
}: Props) {
  const anim = (delay: number) => (animate ? { className: 'draw-path', style: drawStyle(delay) } : {});

  return (
    <figure className={cx('relative w-full', className)}>
      <svg
        viewBox="0 0 640 400"
        className="w-full"
        role="img"
        aria-label={`Cadastral drawing of dag ${dagNo}, ${areaDecimal} decimal, mouza ${mouza}`}
      >
        {/* neighbouring plots — hairline, unlabelled weight */}
        <g stroke="var(--line-strong)" fill="none" strokeWidth="1" opacity="0.85">
          <polygon points="96,58 244,70 232,232 84,214" pathLength={1} {...anim(120)} />
          <polygon points="420,96 566,110 548,258 400,244" pathLength={1} {...anim(200)} />
          <polygon points="248,262 384,282 372,352 240,334" pathLength={1} {...anim(280)} />
        </g>

        <g fill="var(--ink-3)" className="mono" fontSize="10">
          <text x="128" y="150">
            দাগ 1203
          </text>
          <text x="452" y="186">
            দাগ 1206
          </text>
          <text x="278" y="316">
            দাগ 1211
          </text>
        </g>

        {/* subject parcel */}
        <polygon points={SUBJECT} fill="var(--indigo)" opacity="0.07" />
        <polygon
          points={SUBJECT}
          fill="none"
          stroke="var(--indigo)"
          strokeWidth="2"
          strokeLinejoin="round"
          pathLength={1}
          {...anim(340)}
        />

        {/* corner nodes — survey stations, dropped in after the boundary closes */}
        {NODES.map(([x, y], i) => (
          <g key={i} className={animate ? 'anim-mark-in' : undefined} style={{ animationDelay: `${1200 + i * 90}ms` }}>
            <rect x={x - 3.5} y={y - 3.5} width="7" height="7" fill="var(--sheet-raised)" stroke="var(--indigo)" strokeWidth="1.5" />
          </g>
        ))}

        {/* access road — the thing that decides what land is worth */}
        <g stroke="var(--ink-3)" strokeWidth="1" fill="none" opacity="0.9">
          <path d="M40 368 H600" strokeDasharray="7 5" pathLength={1} {...anim(560)} />
          <path d="M40 380 H600" strokeDasharray="7 5" pathLength={1} {...anim(620)} />
        </g>
        <text x="40" y="396" className="mono" fontSize="9.5" fill="var(--ink-3)">
          20 ft union parishad road
        </text>

        {/* subject label block */}
        <g className={animate ? 'anim-mark-in' : undefined} style={{ animationDelay: '1450ms' }}>
          <text x="266" y="152" className="sheet-title" fontSize="21" fontWeight="600" fill="var(--ink)">
            দাগ {dagNo}
          </text>
          <text x="266" y="176" className="mono" fontSize="12" fill="var(--indigo)">
            {areaDecimal.toFixed(2)} decimal
          </text>
          <text x="266" y="196" fontSize="12" fill="var(--ink-2)">
            {landClass}
          </text>
        </g>

        {!compact && (
          <>
            {/* north arrow */}
            <g
              transform="translate(586,52)"
              className={animate ? 'anim-mark-in' : undefined}
              style={{ animationDelay: '1600ms' }}
            >
              <path d="M0,-20 L7,10 L0,4 L-7,10 Z" fill="var(--ink)" />
              <text x="0" y="26" textAnchor="middle" className="mono" fontSize="10" fill="var(--ink-2)">
                N
              </text>
            </g>

            {/* scale bar */}
            <g
              transform="translate(40,40)"
              className={animate ? 'anim-mark-in' : undefined}
              style={{ animationDelay: '1700ms' }}
            >
              <rect x="0" y="0" width="30" height="6" fill="var(--ink)" />
              <rect x="30" y="0" width="30" height="6" fill="none" stroke="var(--ink)" strokeWidth="1" />
              <text x="0" y="22" className="mono" fontSize="9.5" fill="var(--ink-3)">
                0
              </text>
              <text x="54" y="22" className="mono" fontSize="9.5" fill="var(--ink-3)">
                50 ft
              </text>
            </g>
          </>
        )}
      </svg>

      {!compact && (
        <figcaption className="mono mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-2xs uppercase text-ink-3">
          <span>মৌজা {mouza}</span>
          <span>{sheet}</span>
          <span>EPSG:4326</span>
        </figcaption>
      )}
    </figure>
  );
}
