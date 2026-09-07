"use client";

import type { ReactNode } from "react";
import { useState } from "react";

import { DatePicker } from "@/registry/new-york-v4/ui/date-picker";

function Row({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 text-sm">
      <label htmlFor={id} className="font-medium text-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

const today = new Date();
const inSixtyDays = new Date(
  today.getFullYear(),
  today.getMonth(),
  today.getDate() + 60,
);
const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;

export default function DatePickerDemo() {
  const [basic, setBasic] = useState<Date | null>(null);
  const [bounded, setBounded] = useState<Date | null>(null);
  const [workday, setWorkday] = useState<Date | null>(null);
  const [formatted, setFormatted] = useState<Date | null>(() => today);

  return (
    <div className="mx-auto grid w-full max-w-sm gap-4 py-6">
      <Row id="dp-basic" label="Basic">
        <DatePicker id="dp-basic" value={basic} onValueChange={setBasic} />
      </Row>

      <Row id="dp-bounded" label="Next 60 days only">
        <DatePicker
          id="dp-bounded"
          value={bounded}
          onValueChange={setBounded}
          min={today}
          max={inSixtyDays}
          placeholder="Within 60 days"
        />
      </Row>

      <Row id="dp-workday" label="Weekdays only">
        <DatePicker
          id="dp-workday"
          value={workday}
          onValueChange={setWorkday}
          isDateDisabled={isWeekend}
        />
      </Row>

      <Row id="dp-fmt" label="en-GB medium format">
        <DatePicker
          id="dp-fmt"
          value={formatted}
          onValueChange={setFormatted}
          locale="en-GB"
          format={(d) => d.toLocaleDateString("en-GB", { dateStyle: "medium" })}
        />
      </Row>

      <Row id="dp-disabled" label="Disabled">
        <DatePicker id="dp-disabled" defaultValue={today} disabled />
      </Row>
    </div>
  );
}
