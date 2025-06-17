"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "../lib/utils";
const steps = [
    { id: 'idle', label: 'Ready' },
    { id: 'approving', label: 'Approving' },
    { id: 'burning', label: 'Burning' },
    { id: 'waiting-attestation', label: 'Waiting' },
    { id: 'minting', label: 'Minting' },
    { id: 'completed', label: 'Complete' },
    { id: 'error', label: 'Error' },
];
export function ProgressSteps({ currentStep }) {
    const currentIndex = steps.findIndex((step) => step.id === currentStep);
    return (_jsxs("div", { className: "w-full", children: [_jsx("div", { className: "flex justify-between mb-2", children: steps.map((step, index) => (_jsxs("div", { className: cn('flex flex-col items-center', index <= currentIndex ? 'text-blue-600' : 'text-gray-400'), children: [_jsx("div", { className: cn('w-8 h-8 rounded-full flex items-center justify-center mb-1', index <= currentIndex ? 'bg-blue-600 text-white' : 'bg-gray-200'), children: index + 1 }), _jsx("span", { className: "text-sm", children: step.label })] }, step.id))) }), _jsx("div", { className: "relative h-2 bg-gray-200 rounded-full", children: _jsx("div", { className: "absolute h-full bg-blue-600 rounded-full transition-all duration-300", style: {
                        width: `${(currentIndex / (steps.length - 1)) * 100}%`,
                    } }) })] }));
}
