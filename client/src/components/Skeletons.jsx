export function PageSkeleton() {
  return (
    <div className="page-skeleton" aria-label="Loading">
      <span />
      <span />
      <span />
    </div>
  );
}

export function AlertSkeletonList() {
  return (
    <div className="alert-list" aria-label="Loading alerts">
      {Array.from({ length: 4 }).map((_, index) => (
        <article className="alert-card skeleton-card" key={index}>
          <div className="skeleton-line w-40" />
          <div className="skeleton-line w-75" />
          <div className="skeleton-line w-60" />
          <div className="skeleton-grid">
            <span />
            <span />
            <span />
          </div>
        </article>
      ))}
    </div>
  );
}
