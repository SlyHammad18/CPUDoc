import { motion, useReducedMotion } from "motion/react";

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
  disabled?: boolean;
}

export default function Toggle({
  checked,
  onChange,
  label,
  hint,
  disabled,
}: ToggleProps) {
  const reduce = useReducedMotion();
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="text-sm font-medium text-text">{label}</div>
        {hint ? <div className="mt-0.5 text-xs text-muted">{hint}</div> : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ${
          checked ? "bg-accent" : "border border-hairline2 bg-surface2"
        } disabled:opacity-40`}
      >
        <motion.span
          className="absolute left-1 top-1 h-5 w-5 rounded-full bg-bg shadow-sm"
          animate={{ x: checked ? 20 : 0 }}
          transition={
            reduce
              ? { duration: 0 }
              : { type: "spring", stiffness: 500, damping: 32 }
          }
        />
      </button>
    </div>
  );
}