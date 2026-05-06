interface PageHeaderProps {
  pill: string;
  pillColor?: string;
  title: string;
  description?: string;
}

export function PageHeader({
  pill,
  pillColor = "#F5A623",
  title,
  description,
}: PageHeaderProps) {
  return (
    <div
      className="border-b px-4 py-6 md:px-8 md:py-8"
      style={{
        background:
          "linear-gradient(135deg, #FFF3DC 0%, #FFF8F0 60%, #E2F7FA 100%)",
        borderBottomColor: "#FFE4A0",
      }}
    >
      <div className="container mx-auto">
        <span
          className="mb-2 inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide text-white"
          style={{ backgroundColor: pillColor }}
        >
          {pill}
        </span>
        <h1 className="text-2xl font-extrabold text-gray-900 md:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-gray-500 md:text-base">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
