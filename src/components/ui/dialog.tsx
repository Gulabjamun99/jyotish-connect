"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const DialogContext = React.createContext<{
    open: boolean;
    onOpenChange: (open: boolean) => void;
}>({
    open: false,
    onOpenChange: () => { },
});

const Dialog = ({
    children,
    open,
    onOpenChange,
}: {
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}) => {
    const [isOpen, setIsOpen] = React.useState(false);

    // Controlled vs Uncontrolled logic
    const isControlled = open !== undefined;
    const currentOpen = isControlled ? open : isOpen;
    const handleOpenChange = (newOpen: boolean) => {
        if (!isControlled) {
            setIsOpen(newOpen);
        }
        onOpenChange?.(newOpen);
    };

    return (
        <DialogContext.Provider value={{ open: currentOpen!, onOpenChange: handleOpenChange }}>
            {children}
        </DialogContext.Provider>
    );
};

const DialogTrigger = ({
    children,
    asChild,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) => {
    const { onOpenChange } = React.useContext(DialogContext);

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement, {
            onClick: (e: React.MouseEvent) => {
                (children as any).props.onClick?.(e);
                onOpenChange(true);
            },
            ...props
        });
    }

    return (
        <button onClick={() => onOpenChange(true)} {...props}>
            {children}
        </button>
    );
};

const DialogContent = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    const { open, onOpenChange } = React.useContext(DialogContext);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in"
                onClick={() => onOpenChange(false)}
            />

            {/* Content */}
            <div className={cn(
                "relative z-50 grid w-full max-w-lg gap-4 border bg-background p-6 shadow-lg duration-200 animate-in fade-in-0 zoom-in-95 sm:rounded-lg",
                className
            )}>
                {children}
                <button
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                    onClick={() => onOpenChange(false)}
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </button>
            </div>
        </div>
    );
};

const DialogHeader = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            "flex flex-col space-y-1.5 text-center sm:text-left",
            className
        )}
        {...props}
    />
);

const DialogTitle = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
        className={cn(
            "text-lg font-semibold leading-none tracking-tight",
            className
        )}
        {...props}
    />
);

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle };
