"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

export default function CursorFollower() {
    const cursorRef = useRef<HTMLDivElement>(null);
    const dotRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const cursor = cursorRef.current;
        const dot = dotRef.current;
        if (!cursor || !dot) return;

        const pos = { x: 0, y: 0 };
        const mouse = { x: 0, y: 0 };

        const onMouseMove = (e: MouseEvent) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        const onEnterLink = () => gsap.to(cursor, { scale: 2.5, opacity: 0.5, duration: 0.3 });
        const onLeaveLink = () => gsap.to(cursor, { scale: 1, opacity: 1, duration: 0.3 });

        document.addEventListener("mousemove", onMouseMove);
        document.querySelectorAll("a, button").forEach((el) => {
            el.addEventListener("mouseenter", onEnterLink);
            el.addEventListener("mouseleave", onLeaveLink);
        });

        const ticker = gsap.ticker.add(() => {
            pos.x += (mouse.x - pos.x) * 0.15;
            pos.y += (mouse.y - pos.y) * 0.15;
            gsap.set(cursor, { x: pos.x, y: pos.y, xPercent: -50, yPercent: -50 });
            gsap.set(dot, { x: mouse.x, y: mouse.y, xPercent: -50, yPercent: -50 });
        });

        return () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.querySelectorAll("a, button").forEach((el) => {
                el.removeEventListener("mouseenter", onEnterLink);
                el.removeEventListener("mouseleave", onLeaveLink);
            });
            gsap.ticker.remove(ticker);
        };
    }, []);

    return (
        <>
            <div
                ref={cursorRef}
                className="fixed top-0 left-0 w-8 h-8 rounded-full border border-white/30 pointer-events-none z-[9999] mix-blend-difference hidden md:block"
                style={{ willChange: "transform" }}
            />
            <div
                ref={dotRef}
                className="fixed top-0 left-0 w-1.5 h-1.5 rounded-full bg-white pointer-events-none z-[9999] mix-blend-difference hidden md:block"
                style={{ willChange: "transform" }}
            />
        </>
    );
}
