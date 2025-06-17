"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
export function Timer({ isRunning, onTick }) {
    const [startTime, setStartTime] = useState(null);
    const [elapsed, setElapsed] = useState(0);
    const animationRef = useRef(undefined);
    const onTickRef = useRef(onTick);
    onTickRef.current = onTick;
    useEffect(() => {
        if (isRunning && startTime === null) {
            setStartTime(Date.now());
        }
        else if (!isRunning && startTime !== null) {
            setStartTime(null);
        }
    }, [isRunning, startTime]);
    useEffect(() => {
        const animate = () => {
            if (startTime) {
                const now = Date.now();
                const newElapsed = Math.floor((now - startTime) / 1000);
                setElapsed(newElapsed);
                onTickRef.current?.(newElapsed);
            }
            animationRef.current = requestAnimationFrame(animate);
        };
        if (isRunning) {
            animationRef.current = requestAnimationFrame(animate);
        }
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isRunning, startTime]);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return (_jsxs("div", { className: "text-2xl font-mono", children: [_jsx("span", { children: minutes.toString().padStart(2, '0') }), ":", _jsx("span", { children: seconds.toString().padStart(2, '0') })] }));
}
