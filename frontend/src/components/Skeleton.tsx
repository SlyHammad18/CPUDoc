export default function Skeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={`cpudoc-skeleton rounded-md bg-surface2 ${className ?? ""}`}
      aria-hidden
    />
  );
}