import { cn } from "@/lib/utils";

export default function Badge({ number, text, className }: { number?: number; text: string; className?: string }) {
    return (
        <div className={cn("inline-flex items-center h-8 text-[#C9A962] text-xs bg-white/[0.04] border border-white/[0.06] rounded-full mx-auto", className)}>
            {number !== undefined && (
                <div className="h-8 w-8 flex items-center justify-center bg-[#C9A962]/10 rounded-full font-semibold text-sm text-[#C9A962]">{number}</div>
            )}
            <div className="uppercase tracking-[0.15em] py-2 px-4 text-[11px] font-semibold">{text}</div>
        </div>
    );
}
