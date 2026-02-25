"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_OPTIONS = [10, 20, 50, 100];

interface PageSizeSelectorProps {
  value: number;
  onChange: (size: number) => void;
  options?: number[];
  label?: string;
}

export function PageSizeSelector({
  value,
  onChange,
  options = DEFAULT_OPTIONS,
  label = "/ page",
}: PageSizeSelectorProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(String(value));
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(String(value));
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const commitValue = (val: string) => {
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0 && num <= 500) {
      onChange(num);
      setInputValue(String(num));
    } else {
      setInputValue(String(value));
    }
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      commitValue(inputValue);
      inputRef.current?.blur();
    } else if (e.key === "Escape") {
      setInputValue(String(value));
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleOptionClick = (option: number) => {
    onChange(option);
    setInputValue(String(option));
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <div
        className={cn(
          "inline-flex items-center gap-1 rounded-md border bg-background px-2 py-1.5 text-sm",
          open && "ring-1 ring-ring"
        )}
      >
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value.replace(/\D/g, ""))}
          onFocus={() => {
            setOpen(true);
            inputRef.current?.select();
          }}
          onBlur={(e) => {
            if (!containerRef.current?.contains(e.relatedTarget as Node)) {
              commitValue(inputValue);
            }
          }}
          onKeyDown={handleKeyDown}
          className="w-8 bg-transparent text-center outline-none"
        />
        <span className="text-muted-foreground">{label}</span>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="text-muted-foreground hover:text-foreground"
          tabIndex={-1}
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>

      {open && (
        <div className="absolute bottom-full left-0 z-50 mb-1 min-w-[var(--radix-select-trigger-width)] rounded-md border bg-popover p-1 shadow-md">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleOptionClick(option)}
              className={cn(
                "flex w-full items-center rounded-sm px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground",
                value === option && "bg-accent text-accent-foreground"
              )}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
