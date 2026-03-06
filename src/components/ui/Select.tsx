"use client";

import * as React from "react";
import { Listbox, ListboxButton, ListboxOption, ListboxOptions, Transition } from "@headlessui/react";
import { cn } from "@/lib/utils";
import { Check, ChevronUpDownIcon } from "lucide-react";

interface SelectOption {
  id: string | number;
  name: string;
}

interface SelectProps {
  label?: string;
  value: SelectOption;
  onChange: (value: SelectOption) => void;
  options: SelectOption[];
  className?: string;
}

export function Select({ 
  label, 
  value, 
  onChange, 
  options, 
  className 
}: SelectProps) {
  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label className="block text-sm font-medium leading-6 text-slate-900 mb-1">
          {label}
        </label>
      )}
      <Listbox value={value} onChange={onChange}>
        <div className="relative">
          <ListboxButton className="relative w-full cursor-default rounded-md bg-white py-2 pl-3 pr-10 text-left text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
            <span className="block truncate">{value.name}</span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
            </span>
          </ListboxButton>

          <Transition
            as={React.Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {options.map((option) => (
                <ListboxOption
                  key={option.id}
                  className={({ focus }) =>
                    cn(
                      focus ? "bg-indigo-600 text-white outline-none" : "text-slate-900",
                      "relative cursor-default select-none py-2 pl-3 pr-9"
                    )
                  }
                  value={option}
                >
                  {({ selected, focus }) => (
                    <>
                      <span className={cn(selected ? "font-semibold" : "font-normal", "block truncate")}>
                        {option.name}
                      </span>

                      {selected ? (
                        <span
                          className={cn(
                            focus ? "text-white" : "text-indigo-600",
                            "absolute inset-y-0 right-0 flex items-center pr-4"
                          )}
                        >
                          <Check className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}
