export default function StatCard({ icon: Icon, label, value, tone = "neutral" }) {
  return (
    <section className={`stat-card ${tone}`}>
      <div className="stat-icon">{Icon ? <Icon size={18} aria-hidden="true" /> : null}</div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </section>
  );
}
