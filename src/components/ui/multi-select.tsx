
import React from "react";
import { CheckIcon, X } from "lucide-react";
import { Badge } from "./badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "./command";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { cn } from "@/lib/utils";
import { ScrollArea } from "./scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select options",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const isMobile = useIsMobile();

  // Ensure options is always a valid array
  const safeOptions = Array.isArray(options) ? options : [];

  // Ensure value is always a valid array
  const safeValue = Array.isArray(value) ? value : [];

  // Filter selected options safely
  const selectedOptions = safeOptions.filter((option) => safeValue.includes(option.value));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          className={cn(
            "flex min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer",
            className
          )}
        >
          <div className="flex flex-wrap gap-1">
            {selectedOptions.length > 0 ? (
              selectedOptions.map((option) => (
                <Badge
                  key={option.value}
                  variant="secondary"
                  className="flex items-center gap-1 px-2"
                >
                  {option.label}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange(safeValue.filter((v) => v !== option.value));
                    }}
                  />
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[--radix-popover-trigger-width] p-0" 
        align="start"
        sideOffset={isMobile ? 5 : 0}
        alignOffset={isMobile ? 0 : 0}
      >
        {safeOptions.length > 0 ? (
          <Command>
            <CommandInput placeholder="Search..." />
            <CommandEmpty>No results found.</CommandEmpty>
            <ScrollArea className={cn("max-h-60", isMobile && "max-h-[40vh]")}>
              <CommandGroup>
                {safeOptions.map((option) => {
                  const isSelected = safeValue.includes(option.value);
                  return (
                    <CommandItem
                      key={option.value}
                      onSelect={() => {
                        onChange(
                          isSelected
                            ? safeValue.filter((v) => v !== option.value)
                            : [...safeValue, option.value]
                        );
                      }}
                      className={isMobile ? "py-3" : ""}
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                          isSelected ? "bg-primary text-primary-foreground" : "opacity-50"
                        )}
                      >
                        {isSelected && <CheckIcon className="h-3 w-3" />}
                      </div>
                      {option.label}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </ScrollArea>
          </Command>
        ) : (
          <div className="py-6 text-center text-sm">No options available</div>
        )}
      </PopoverContent>
    </Popover>
  );
}
