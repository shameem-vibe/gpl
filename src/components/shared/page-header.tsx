export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="stripes border-b border-chalk/10 bg-pitch-800/40">
      <div className="container py-12 md:py-16">
        <h1 className="text-5xl md:text-7xl">{title}</h1>
        {description ? <p className="mt-3 max-w-2xl text-lg text-chalk-dim">{description}</p> : null}
      </div>
    </div>
  );
}
