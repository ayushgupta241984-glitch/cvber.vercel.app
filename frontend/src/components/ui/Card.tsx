import { cn } from "@/lib/utils";

export default function Card({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn("rounded-2xl text-sm md:text-base h-full bg-[#111111] border border-white/[0.06] p-8 md:p-10 flex flex-col items-start justify-start text-start gap-4 md:gap-5 transition-all duration-500 hover:border-[#C9A962]/20", className)}>
            {children}
        </div>
    );
}
