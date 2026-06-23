type Props = {
  label: string;
  progress?: number;
};

export function StatusPill({ label, progress }: Props) {
  return (
    <div className="c-status-pill">
      <span className="c-status-pill__label">{label}</span>
      {typeof progress === "number" ? (
        <span
          className="c-status-pill__meter"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
        >
          <span
            className="c-status-pill__meter-fill"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </span>
      ) : null}
    </div>
  );
}
