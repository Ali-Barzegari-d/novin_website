/**
 * A responsive, semantic sequence for pages where the order itself matters.
 * It is purposefully an ordered list, not a drawn chart.
 */
type Station = { title: string; note?: string };

export function StationPath({ stations, ariaLabel }: { stations: Station[]; ariaLabel: string }) {
  return (
    <ol className="station-path" aria-label={ariaLabel} style={{ '--station-count': stations.length } as React.CSSProperties}>
      {stations.map((station, index) => (
        <li key={station.title}>
          <span className="station-index">{(index + 1).toLocaleString('fa-IR')}</span>
          <span className="station-title">{station.title}</span>
          {station.note ? <span className="station-note">{station.note}</span> : null}
        </li>
      ))}
    </ol>
  );
}
