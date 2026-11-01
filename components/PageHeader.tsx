export default function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-4">
      <h1 className="text-xl sm:text-2xl font-bold text-white">{title}</h1>
      <p className="text-xs sm:text-sm text-slate-400 mt-0.5">{subtitle}</p>
    </div>
  );
}
