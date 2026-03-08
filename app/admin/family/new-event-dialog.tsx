"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Baby, Heart, Flower2 } from "lucide-react";

export type NewEventChoice = "birth" | "marriage" | "death";

interface NewEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChoice?: (choice: NewEventChoice) => void;
}

const choices: { value: NewEventChoice; label: string; icon: React.ReactNode }[] = [
  {
    value: "birth",
    label: "Annoncer une naissance",
    icon: <Baby className="h-6 w-6" />,
  },
  {
    value: "marriage",
    label: "Annoncer un mariage / une union",
    icon: <Heart className="h-6 w-6" />,
  },
  {
    value: "death",
    label: "Annoncer un décès",
    icon: <Flower2 className="h-6 w-6" />,
  },
];

export function NewEventDialog({
  open,
  onOpenChange,
  onChoice,
}: NewEventDialogProps) {
  const handleSelect = (choice: NewEventChoice) => {
    onChoice?.(choice);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouvel événement</DialogTitle>
        </DialogHeader>
        <div className="grid gap-2 py-2">
          {choices.map(({ value, label, icon }) => (
            <Button
              key={value}
              variant="outline"
              className="h-auto flex flex-col items-stretch gap-1 p-4 text-left"
              onClick={() => handleSelect(value)}
            >
              <span className="flex items-center gap-2 font-medium">
                <span className="text-emerald-600">{icon}</span>
                {label}
              </span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
