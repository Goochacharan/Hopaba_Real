
import * as React from "react"
import { cn } from "@/lib/utils"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  formatRupees?: boolean;
}

const formatIndianRupees = (value: string): string => {
  if (!value) return "";
  
  // Remove non-numeric characters
  const numericValue = value.replace(/[^0-9]/g, "");
  
  // Convert to number and format
  const numValue = parseFloat(numericValue);
  if (isNaN(numValue)) return "";
  
  if (numValue >= 100000) {
    const lakhs = (numValue / 100000).toFixed(1);
    return `₹${lakhs} Lakhs`;
  } else if (numValue >= 1000) {
    const thousands = Math.floor(numValue / 1000);
    return `₹${thousands} Thousands`;
  } else {
    return `₹${numValue}`;
  }
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, formatRupees, ...props }, ref) => {
    const [formattedValue, setFormattedValue] = React.useState<string>("");
    const [rawValue, setRawValue] = React.useState<string>("");

    React.useEffect(() => {
      if (formatRupees && props.value) {
        setFormattedValue(formatIndianRupees(props.value.toString()));
        setRawValue(props.value.toString().replace(/[^0-9]/g, ""));
      }
    }, [formatRupees, props.value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (formatRupees) {
        const inputValue = e.target.value.replace(/[^0-9]/g, "");
        setRawValue(inputValue);
        setFormattedValue(formatIndianRupees(inputValue));
        
        // Create a synthetic event with the raw numeric value
        const syntheticEvent = {
          ...e,
          target: {
            ...e.target,
            value: inputValue
          }
        };
        
        props.onChange?.(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
      } else if (props.onChange) {
        props.onChange(e);
      }
    };

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        value={formatRupees ? formattedValue : props.value}
        onChange={handleChange}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input, formatIndianRupees }
