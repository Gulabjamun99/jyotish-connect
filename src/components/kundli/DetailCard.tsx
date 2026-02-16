interface DetailRowProps {
    label: string;
    value: string | number;
    highlight?: boolean;
}

export function DetailRow({ label, value, highlight }: DetailRowProps) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-primary/5 last:border-0">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className={`text-sm font-bold ${highlight ? "text-primary" : "text-foreground"}`}>
                {value}
            </span>
        </div>
    );
}

interface DetailCardProps {
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    highlight?: boolean;
}

export function DetailCard({ title, icon, children, highlight }: DetailCardProps) {
    return (
        <div className={`glass p-6 rounded-2xl border transition-all ${highlight
                ? "border-primary/30 bg-primary/5"
                : "border-primary/10 hover:border-primary/20"
            }`}>
            <div className="flex items-center gap-3 mb-4">
                {icon && (
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        {icon}
                    </div>
                )}
                <h3 className="text-lg font-bold text-foreground">{title}</h3>
            </div>
            <div className="space-y-1">
                {children}
            </div>
        </div>
    );
}
