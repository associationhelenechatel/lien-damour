"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function DatePicker({
  value,
  onChange,
  contentClassName,
}: {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  /** À passer quand le DatePicker est dans un overlay (ex. Clerk UserButton) pour que le calendrier s'affiche au-dessus (ex. contentClassName="z-[10000]") */
  contentClassName?: string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          id="date"
          className="w-48 justify-between font-normal"
        >
          {value ? value.toLocaleDateString("fr-FR") : "Choisir une date"}
          <ChevronDownIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn("w-auto overflow-hidden p-0", contentClassName)}
        align="start"
      >
        <Calendar
          mode="single"
          selected={value}
          captionLayout="dropdown"
          className="w-60"
          onSelect={(newDate) => {
            onChange(newDate);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
