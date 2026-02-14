"use client";

import React, { useCallback, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import * as RPNInput from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import { Button } from './button';
import { cn } from '@/lib/utils';
import { CheckIcon, ChevronsUpDown } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './command';
import { ScrollArea } from './scroll-area';
import { Input } from "./input"

const CustomInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        className={cn(
          "flex-1 border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-full rounded-none px-3",
          className
        )}
        {...props}
      />
    );
  }
);
CustomInput.displayName = "CustomInput";

type InputPhoneProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value"
> &
  Omit<RPNInput.Props<typeof RPNInput.default>, "onChange"> & {
    onChange?: (value: RPNInput.Value) => void;
    popoverFontSize?: string;
  };

export const InputPhone: React.ForwardRefExoticComponent<InputPhoneProps> =
  React.forwardRef<React.ElementRef<typeof RPNInput.default>, InputPhoneProps>(
    ({ className, onChange, popoverFontSize, ...props }, ref) => {
      const containerRef = React.useRef<HTMLDivElement>(null);

      return (
        <div ref={containerRef} className="w-full">
          <RPNInput.default
            ref={ref}
            className={cn(
              "flex w-full items-center overflow-hidden transition-all",
              className
            )}
            flagComponent={FlagComponent}
            countrySelectComponent={(props) => (
              <CountrySelect
                {...props}
                popoverFontSize={popoverFontSize}
                containerRef={containerRef}
              />
            )}
            inputComponent={CustomInput}
            onChange={(value) => {
              if (value) onChange?.(value);
              else onChange?.("" as RPNInput.Value);
            }}
            {...props}
          />
        </div>
      );
    },
  );
InputPhone.displayName = "InputPhone";

const CountrySelect = ({
  disabled,
  value,
  onChange,
  options,
  popoverFontSize,
  containerRef
}: CountrySelectProps & { popoverFontSize?: string; containerRef: React.RefObject<HTMLDivElement> }) => {
  const handleSelect = useCallback(
    (country: RPNInput.Country) => {
      onChange(country);
    },
    [onChange],
  );

  const [open, setOpen] = useState(false)

  return (
    <Popover modal open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className={cn(
            "flex gap-1.5 px-3 h-full rounded-none border-r border-gray-100 hover:bg-gray-50/50 transition-colors shrink-0 outline-none focus-visible:ring-0"
          )}
          disabled={disabled}
        >
          <FlagComponent country={value} countryName={value} />
          <ChevronsUpDown
            className={cn("size-3.5 opacity-40", disabled ? "hidden" : "opacity-100")}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 overflow-hidden"
        align="start"
        style={{ width: containerRef.current?.offsetWidth ? `${containerRef.current.offsetWidth * 0.75}px` : "300px" }}
      >
        <Command>
          <CommandInput placeholder="Search country..." />
          <CommandList>
            <ScrollArea className="h-72">
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup>
                {options
                  .filter((x) => x.value)
                  .map((option) => (
                    <CommandItem
                      className="gap-2"
                      key={option.value}
                      onSelect={() => handleSelect(option.value)}
                    >
                      <FlagComponent country={option.value} countryName={option.label} />
                      <span className={cn("flex-1", popoverFontSize)}>{option.label}</span>
                      {option.value && (
                        <span className={cn("text-foreground/50", popoverFontSize)}>
                          {`+${RPNInput.getCountryCallingCode(option.value)}`}
                        </span>
                      )}
                      <CheckIcon
                        className={cn(
                          "ml-auto size-4",
                          option.value === value ? "opacity-100" : "opacity-0",
                        )}
                      />
                    </CommandItem>
                  ))}
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};


const FlagComponent = ({ country, countryName }: RPNInput.FlagProps) => {
  const Flag = flags[country];

  return (
    <span className="flex h-4 w-6 overflow-hidden rounded-sm">
      {Flag && <Flag title={countryName} />}
    </span>
  );
};
FlagComponent.displayName = "FlagComponent";

type CountrySelectOption = { label: string; value: RPNInput.Country };

type CountrySelectProps = {
  disabled?: boolean;
  value: RPNInput.Country;
  onChange: (value: RPNInput.Country) => void;
  options: CountrySelectOption[];
};
