"use client";
import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
export function TransferLog({ logs }) {
    const logsEndRef = useRef(null);
    const containerRef = useRef(null);
    useEffect(() => {
        if (logsEndRef.current && containerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
            const isNearBottom = scrollHeight - (scrollTop + clientHeight) < 100;
            if (isNearBottom) {
                logsEndRef.current.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest"
                });
            }
        }
    }, [logs]);
    return (_jsx("div", { ref: containerRef, className: "w-full max-w-2xl mx-auto mt-8 p-4 bg-gray-50 rounded-lg h-64 overflow-y-auto", children: _jsxs("div", { className: "text-sm font-mono", children: [logs.map((log, index) => (_jsxs("div", { className: "text-gray-700", children: [log, " "] }, index))), _jsx("div", { ref: logsEndRef })] }) }));
}
