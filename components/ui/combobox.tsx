"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type ComboboxOption = {
  value: string;
  label: React.ReactNode;
  /** Mots-clés supplémentaires pour le filtrage cmdk (prénom, nom, code, etc.) */
  keywords?: string[];
  disabled?: boolean;
};

export type ComboboxProps = {
  options: ComboboxOption[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
  contentClassName?: string;
  id?: string;
  "aria-labelledby"?: string;
};

function resolveSelectedLabel(
  options: ComboboxOption[],
  value: string | undefined
): React.ReactNode | null {
  if (value == null || value === "") return null;
  const opt = options.find((o) => o.value === value);
  return opt?.label ?? null;
}

/**
 * Liste déroulante avec recherche (pattern Combobox shadcn : Popover + Command).
 */
export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Sélectionner…",
  searchPlaceholder = "Rechercher…",
  emptyText = "Aucun résultat.",
  disabled = false,
  className,
  contentClassName,
  id,
  "aria-labelledby": ariaLabelledBy,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const displayLabel = resolveSelectedLabel(options, value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          aria-labelledby={ariaLabelledBy}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "h-9 w-full justify-between font-normal shadow-sm bg-white",
            !displayLabel && "text-muted-foreground",
            className
          )}
        >
          <span className="truncate text-left">
            {displayLabel ?? placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn("w-[var(--radix-popover-trigger-width)] p-0", contentClassName)}
        align="start"
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  keywords={option.keywords}
                  disabled={option.disabled}
                  onSelect={(selected) => {
                    const match = options.find(
                      (o) => o.value.toLowerCase() === selected.toLowerCase()
                    );
                    if (match) {
                      onValueChange(
                        value === match.value ? "" : match.value
                      );
                    }
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "h-4 w-4 shrink-0",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="min-w-0 flex-1 truncate">{option.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
