import { cn } from "@/lib/utils";

export default function FadeEffect({ className, position = "bottom" }: { className?: string; position?: "top" | "bottom" | "left" | "right" }) {
    const positionClass = position === "bottom" ? "bottom-0" : position === "top" ? "top-0" : position === "left" ? "left-0" : "right-0";
    const gradient = position === "bottom" || position === "top"
        ? "bg-gradient-to-b from-transparent to-[#080808]"
        : "bg-gradient-to-r from-transparent to-[#080808]";

    return (
        <div className={cn(`absolute w-full h-1/3 ${positionClass} left-0 ${gradient} z-10 pointer-events-none`, className)} />
    );
}
