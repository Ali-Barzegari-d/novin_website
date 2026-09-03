/**
 * Horizontal RTL station path: nodes sit on one continuous rail whose
 * gradient follows the validated ordinal ramp; the terminus carries an
 * arrowhead pointing with the reading direction. Labels stay in HTML.
 * Used for مسئله/اقدام/نتیجه summaries and the cooperation path.
 */
const ramp = ['#12a094', '#0a66c2', '#a0325c', '#7a4a00', '#06524a'];

type Station = { title: string; note?: string };

export function StationPath({ stations, ariaLabel }: { stations: Station[]; ariaLabel: string }) {
  return (
    <ol className="station-path" aria-label={ariaLabel} style={{ '--station-count': stations.length } as React.CSSProperties}>
      {stations.map((station, index) => (
        <li key={station.title} style={{ '--station-color': ramp[index % ramp.length] } as React.CSSProperties}>
          <span className="station-node" aria-hidden="true" />
          <span className="station-title">{station.title}</span>
          {station.note ? <span className="station-note">{station.note}</span> : null}
        </li>
      ))}
    </ol>
  );
}
