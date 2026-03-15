"use client";

import * as React from "react";
import { Listbox, ListboxButton, ListboxOption, ListboxOptions, Transition } from "@headlessui/react";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";

export interface SelectOption {
  value?: string | number;
  label?: string;
  id?: string | number;
  name?: string;
}

interface NormalizedOption {
  value: string | number;
  label: string;
}

interface SelectProps {
  label?: string;
  value: string | number | SelectOption | null | undefined;
  onChange: (value: any) => void;
  options: SelectOption[];
  className?: string;
  disabled?: boolean;
  error?: string;
  placeholder?: string;
}

export function Select({ 
  label, 
  value, 
  onChange, 
  options, 
  className,
  disabled = false,
  error,
  placeholder = "Select an option",
}: SelectProps) {
  // Helper to normalize options
  const normalizedOptions = React.useMemo<NormalizedOption[]>(() => options.map(opt => ({
    value: opt.value ?? opt.id ?? "",
    label: opt.label ?? opt.name ?? "",
  })), [options]);

  // Helper to find the current selected option object for display
  const selectedOption = React.useMemo<NormalizedOption | undefined>(() => {
    if (value === undefined || value === null || value === "") return undefined;
    
    if (typeof value === 'object') {
      const val = value.value ?? value.id ?? "";
      return normalizedOptions.find(opt => opt.value === val) || { 
        value: val, 
        label: value.label ?? value.name ?? String(val) 
      };
    }
    return normalizedOptions.find(opt => opt.value === value);
  }, [value, normalizedOptions]);

  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  const handleChange = (val: NormalizedOption) => {
    // If original value was an object style, return the matching original option object
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      const originalOption = options.find(opt => (opt.value ?? opt.id) === val.value);
      onChange(originalOption);
    } else {
      onChange(val.value);
    }
  };

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <Listbox 
        value={selectedOption} 
        onChange={handleChange} 
        disabled={disabled}
      >
        <div className="relative">
          <ListboxButton
            className={cn(
              "relative w-full rounded-lg bg-background py-2 pl-3 pr-10 text-left text-sm border border-input shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
              disabled && "cursor-not-allowed opacity-50",
              !disabled && "cursor-default",
              error && "border-destructive focus:ring-destructive",
            )}
          >
            <span className={cn("block truncate", !selectedOption && "text-muted-foreground/60")}>
              {displayLabel}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronsUpDown className="h-4 w-4 text-muted-foreground/60" aria-hidden="true" />
            </span>
          </ListboxButton>

          <Transition
            as={React.Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <ListboxOptions className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-popover py-1 text-sm shadow-lg ring-1 ring-border focus:outline-none">
              {normalizedOptions.map((option, idx) => (
                <ListboxOption
                  key={idx}
                  className={({ focus, selected }) =>
                    cn(
                      "relative cursor-default select-none py-2 pl-3 pr-9 transition-colors",
                      focus ? "bg-accent text-accent-foreground" : "text-foreground",
                      selected && "font-medium bg-accent/50"
                    )
                  }
                  value={option}
                >
                  {({ selected }) => (
                    <>
                      <span className={cn("block truncate", selected ? "font-semibold" : "font-normal")}>
                        {option.label}
                      </span>

                      {selected && (
                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-primary">
                          <Check className="h-4 w-4" aria-hidden="true" />
                        </span>
                      )}
                    </>
                  )}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </Transition>
        </div>
      </Listbox>
      {error && (
        <p className="text-xs font-medium text-destructive">{error}</p>
      )}
    </div>
  );
}
