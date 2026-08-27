import type { ReactNode } from "react";

interface FieldShellProps {
  children: ReactNode;
  hint?: string;
  htmlFor: string;
  label: string;
}

interface TextFieldProps {
  defaultValue?: string;
  hint?: string;
  htmlFor: string;
  label: string;
  maxLength: number;
  name: string;
  required?: boolean;
  type?: "text" | "tel" | "number";
}

interface TextAreaFieldProps {
  defaultValue?: string;
  hint?: string;
  htmlFor: string;
  label: string;
  maxLength: number;
  name: string;
  rows?: number;
}

interface SelectOption {
  label: string;
  value: string;
}

interface SelectFieldProps {
  defaultValue?: string;
  hint?: string;
  htmlFor: string;
  label: string;
  name: string;
  options: SelectOption[];
  required?: boolean;
}

const CONTROL_CLASS_NAME =
  "min-h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-50/80 px-4 py-3 text-base text-zinc-950 outline-none transition placeholder:text-zinc-400 hover:border-zinc-300 focus:border-[#fd267a] focus:bg-white focus:ring-4 focus:ring-[#fd267a]/10";

export const FieldShell = ({
  children,
  hint,
  htmlFor,
  label,
}: FieldShellProps) => {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-zinc-800">
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-zinc-500">{hint}</p> : null}
    </div>
  );
};

export const TextField = ({
  defaultValue,
  hint,
  htmlFor,
  label,
  maxLength,
  name,
  required = false,
  type = "text",
}: TextFieldProps) => {
  return (
    <FieldShell hint={hint} htmlFor={htmlFor} label={label}>
      <input
        id={htmlFor}
        name={name}
        type={type}
        defaultValue={defaultValue}
        maxLength={maxLength}
        min={type === "number" ? 18 : undefined}
        required={required}
        className={CONTROL_CLASS_NAME}
      />
    </FieldShell>
  );
};

export const TextAreaField = ({
  defaultValue,
  hint,
  htmlFor,
  label,
  maxLength,
  name,
  rows = 4,
}: TextAreaFieldProps) => {
  return (
    <FieldShell hint={hint} htmlFor={htmlFor} label={label}>
      <textarea
        id={htmlFor}
        name={name}
        defaultValue={defaultValue}
        maxLength={maxLength}
        rows={rows}
        className={`${CONTROL_CLASS_NAME} min-h-28 resize-y leading-6`}
      />
    </FieldShell>
  );
};

export const SelectField = ({
  defaultValue,
  hint,
  htmlFor,
  label,
  name,
  options,
  required = false,
}: SelectFieldProps) => {
  return (
    <FieldShell hint={hint} htmlFor={htmlFor} label={label}>
      <select
        id={htmlFor}
        name={name}
        defaultValue={defaultValue || ""}
        required={required}
        className={CONTROL_CLASS_NAME}
      >
        {required ? null : <option value="">Not set</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
};
