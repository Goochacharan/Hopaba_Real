
import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  formatRupees?: boolean;
}

/**
 * Formats a number as Indian Rupees with commas
 * e.g., 100000 becomes ₹1,00,000
 */
export const formatIndianRupees = (value: string): string => {
  if (!value) return "₹0";
  
  // Remove non-numeric characters
  const numericValue = value.replace(/[^0-9]/g, '');
  
  // Convert to number
  const amount = parseInt(numericValue);
  
  // Format according to Indian numbering system (lakhs, crores)
  // For example: 10,00,000 (10 lakhs)
  if (isNaN(amount)) return "₹0";
  
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  
  return formatter.format(amount);
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, formatRupees, ...props }, ref) => {
    const [formattedValue, setFormattedValue] = React.useState<string>('');
    
    // Handle rupee formatting if the formatRupees prop is true
    React.useEffect(() => {
      if (formatRupees && props.value !== undefined) {
        setFormattedValue(formatIndianRupees(props.value.toString()).replace('₹', ''));
      }
    }, [formatRupees, props.value]);

    // For rupee formatting, we may need to modify the onChange handler
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (formatRupees) {
        // Only allow numbers
        const value = e.target.value.replace(/[^0-9]/g, '');
        
        // Update the display value with formatting
        if (value) {
          setFormattedValue(formatIndianRupees(value).replace('₹', ''));
        } else {
          setFormattedValue('');
        }
        
        // Create a synthetic event with the numeric value for the parent handler
        const syntheticEvent = {
          ...e,
          target: {
            ...e.target,
            value: value
          }
        };
        
        // Call the original onChange handler if it exists
        if (props.onChange) {
          props.onChange(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
        }
      } else if (props.onChange) {
        // If not formatting, just call the original handler
        props.onChange(e);
      }
    };
    
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
        value={formatRupees ? formattedValue : props.value}
        onChange={handleChange}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
