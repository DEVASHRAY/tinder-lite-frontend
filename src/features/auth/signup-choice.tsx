"use client";

interface SignupChoiceProps {
  label: string;
  selected: boolean;
  onSelect: () => void;
}

export const SignupChoice = ({
  label,
  selected,
  onSelect,
}: SignupChoiceProps) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={
        selected
          ? "rounded-full bg-white px-5 py-3 text-left text-sm font-semibold text-zinc-950 shadow-[0_12px_30px_-16px_rgba(255,255,255,0.7)]"
          : "rounded-full border border-white/20 bg-white/8 px-5 py-3 text-left text-sm font-semibold text-white/80 transition hover:border-white/50 hover:bg-white/12"
      }
    >
      {label}
    </button>
  );
};
