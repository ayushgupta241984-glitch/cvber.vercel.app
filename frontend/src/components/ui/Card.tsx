import { cn } from "@/lib/utils";

export default function Card({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn("text-sm md:text-base h-full p-8 md:p-10 flex flex-col items-start justify-start text-start gap-4 md:gap-5 transition-all duration-200", className)}
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
            {children}
        </div>
    );
}
