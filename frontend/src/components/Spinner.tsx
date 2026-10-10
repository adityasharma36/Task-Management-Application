export default function Spinner({ label = 'Loading' }: { label?: string }) {
  return <div className="spinner-wrap" role="status"><span className="spinner" /><span className="sr-only">{label}</span></div>;
}
