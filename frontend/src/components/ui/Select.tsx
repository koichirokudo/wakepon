import type React from "react";
import { forwardRef } from "react";
import './ui.css';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  values: { id: string, name: string }[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ values, className, ...props }, ref) => (
    <select ref={ref} className="select-base" {...props}>
      {values.map((value) => (
        <option key={String(value.id)} value={String(value.id)}>
          {value.name}
        </option>
      ))}
    </select>
  )
);

Select.displayName = "Select";
export default Select;