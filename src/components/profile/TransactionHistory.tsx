import { format } from "date-fns";
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";

interface Transaction {
    id: string;
    amount: number;
    type: 'credit' | 'debit';
    description: string;
    date: Date | string | any; // Handle Firestore Timestamp
    status: 'success' | 'pending' | 'failed';
}

interface TransactionHistoryProps {
    transactions: Transaction[];
    title?: string;
}

export function TransactionHistory({ transactions, title }: TransactionHistoryProps) {
    const t = useTranslations("Index");
    const displayTitle = title || t("transaction_history");

    const formatDate = (date: any) => {
        if (!date) return "";
        const d = new Date(date.seconds ? date.seconds * 1000 : date);
        return format(d, "MMM dd, yyyy • hh:mm a");
    };

    return (
        <div className="glass p-8 rounded-[2.5rem] space-y-8 border-primary/10">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-foreground uppercase tracking-tight">{displayTitle}</h3>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/20">
                    {transactions.length} Records
                </span>
            </div>

            <div className="space-y-4">
                {transactions.length === 0 ? (
                    <div className="text-center py-12 text-foreground/30 font-medium italic">
                        {t("no_transactions")}
                    </div>
                ) : (
                    transactions.map((tx) => (
                        <div key={tx.id} className="group relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="relative flex items-center justify-between p-6 rounded-2xl border border-primary/5 hover:border-primary/20 transition-all bg-white/50">
                                <div className="flex items-center gap-6">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-sm ${tx.type === 'credit'
                                        ? 'bg-green-500/10 border-green-500/20 text-green-600'
                                        : 'bg-orange-500/10 border-orange-500/20 text-orange-600'
                                        }`}>
                                        {tx.type === 'credit' ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-bold text-foreground text-sm uppercase tracking-wide">{tx.description}</p>
                                        <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest flex items-center gap-2">
                                            {formatDate(tx.date)}
                                            {tx.status === 'success' && <CheckCircle className="w-3 h-3 text-green-500" />}
                                            {tx.status === 'pending' && <Clock className="w-3 h-3 text-amber-500" />}
                                            {tx.status === 'failed' && <XCircle className="w-3 h-3 text-red-500" />}
                                        </p>
                                    </div>
                                </div>

                                <div className={`text-xl font-black tracking-tight ${tx.type === 'credit' ? 'text-green-600' : 'text-foreground'
                                    }`}>
                                    {tx.type === 'credit' ? '+' : '-'} ₹{tx.amount}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
