"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
    addMonths,
    eachDayOfInterval,
    endOfMonth,
    format,
    getDay,
    isSameDay,
    isSameMonth,
    isToday,
    startOfMonth,
    startOfToday,
    subMonths,
} from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type CalendarProps = {
    mode?: "single";
    selected?: Date;
    onSelect?: (date: Date | undefined) => void;
    className?: string;
    disabled?: (date: Date) => boolean;
};

export function Calendar({
    mode = "single",
    selected,
    onSelect,
    className,
    disabled,
}: CalendarProps) {
    const today = startOfToday();
    const [currentMonth, setCurrentMonth] = React.useState(format(today, "MMM-yyyy"));
    const firstDayCurrentMonth = startOfMonth(new Date(currentMonth));

    const days = eachDayOfInterval({
        start: firstDayCurrentMonth,
        end: endOfMonth(firstDayCurrentMonth),
    });

    const previousMonth = () => {
        const firstDayNextMonth = subMonths(firstDayCurrentMonth, 1);
        setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"));
    };

    const nextMonth = () => {
        const firstDayNextMonth = addMonths(firstDayCurrentMonth, 1);
        setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"));
    };

    return (
        <div className={cn("p-3", className)}>
            <div className="flex items-center justify-between mb-4">
                <p className="font-semibold text-sm">
                    {format(firstDayCurrentMonth, "MMMM yyyy")}
                </p>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={previousMonth}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={nextMonth}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-muted-foreground p-1">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: getDay(firstDayCurrentMonth) }).map((_, i) => (
                    <div key={`empty-${i}`} />
                ))}
                {days.map((day) => {
                    const isSelected = selected && isSameDay(day, selected);
                    const isCurrentMonth = isSameMonth(day, firstDayCurrentMonth);
                    const isDisabled = disabled ? disabled(day) : false;

                    return (
                        <button
                            key={day.toString()}
                            onClick={() => !isDisabled && onSelect && onSelect(day)}
                            disabled={isDisabled}
                            className={cn(
                                "h-8 w-8 rounded-md text-sm p-0 font-normal aria-selected:opacity-100 transition-all",
                                !isCurrentMonth && "text-muted-foreground opacity-50",
                                isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                                !isSelected && !isDisabled && "hover:bg-accent hover:text-accent-foreground",
                                isDisabled && "text-muted-foreground opacity-50 cursor-not-allowed",
                                isToday(day) && !isSelected && "bg-accent/50 text-accent-foreground border border-primary/20"
                            )}
                        >
                            <time dateTime={format(day, "yyyy-MM-dd")}>
                                {format(day, "d")}
                            </time>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
