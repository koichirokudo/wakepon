import type React from "react";
import { forwardRef } from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  values: { id: string, name: string }[];
  error?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, values, className, ...props }, ref) => (
    <div>
      {label && <label className="label-base">{label}</label>}
      <select ref={ref} className="select-base" {...props}>
        {values.map((value) => (
          <option key={String(value.id)} value={String(value.id)}>
            {value.name}
          </option>
        ))}
      </select>
      {error && <p className="input-error">{error}</p>}
    </div>
  )
);

Select.displayName = "Select";
export default Select;
