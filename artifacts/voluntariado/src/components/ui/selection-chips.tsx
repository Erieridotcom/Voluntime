import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

interface SelectionChipsProps {
  label: string;
  description?: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
  maxSelect?: number;
  className?: string;
}

export function SelectionChips({
  label,
  description,
  options,
  selected,
  onChange,
  maxSelect,
  className,
}: SelectionChipsProps) {
  const toggle = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((s) => s !== option));
    } else {
      if (maxSelect && selected.length >= maxSelect) return;
      onChange([...selected, option]);
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div>
        <p className="text-sm font-semibold text-foreground">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
        {maxSelect && (
          <p className="text-xs text-primary font-medium mt-0.5">
            {selected.length}/{maxSelect} seleccionados
          </p>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selected.includes(option);
          return (
            <motion.button
              key={option}
              type="button"
              data-testid={`chip-${option.toLowerCase().replace(/\s+/g, "-")}`}
              onClick={() => toggle(option)}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 cursor-pointer select-none",
                isSelected
                  ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/30"
                  : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground hover:bg-muted/50"
              )}
            >
              {isSelected && <Check className="w-3 h-3 shrink-0" />}
              {option}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
