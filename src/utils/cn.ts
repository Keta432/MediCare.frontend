import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

type ClassValue = string | number | boolean | undefined | null;
type ClassArray = ClassValue[];
type ClassObject = { [key: string]: any };
type ClassInput = ClassValue | ClassArray | ClassObject;

export function cn(...inputs: ClassInput[]): string {
  const classes: string[] = [];
  
  inputs.forEach((input) => {
    if (!input) return;
    
    if (typeof input === 'string') {
      classes.push(input);
    } else if (Array.isArray(input)) {
      classes.push(cn(...input));
    } else if (typeof input === 'object') {
      Object.entries(input).forEach(([key, value]) => {
        if (value) classes.push(key);
      });
    }
  });
  
  return classes.filter(Boolean).join(' ');
} 