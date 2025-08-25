"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { cn } from "../lib/utils";
import { CreditCard, Loader2, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
const steps = [
    { id: 'idle', label: 'Ready', icon: CreditCard },
    { id: 'processing', label: 'Processing', icon: Loader2 },
    { id: 'confirming', label: 'Confirming', icon: ArrowRight },
    { id: 'completed', label: 'Complete', icon: CheckCircle2 },
    { id: 'error', label: 'Error', icon: XCircle },
];
export function ProgressSteps({ currentStep }) {
    const currentIndex = steps.findIndex((step) => step.id === currentStep);
    const isError = currentStep === 'error';
    // Don't show error in the normal flow
    const visibleSteps = steps.filter(step => step.id !== 'error');
    const visibleCurrentIndex = currentStep === 'error' ? -1 : visibleSteps.findIndex((step) => step.id === currentStep);
    if (isError) {
        return (_jsx("div", { className: "w-full", children: _jsx("div", { className: "flex justify-center mb-4", children: _jsxs("div", { className: "flex flex-col items-center text-red-600", children: [_jsx("div", { className: "w-12 h-12 rounded-full flex items-center justify-center mb-2 bg-red-100", children: _jsx(XCircle, { className: "w-6 h-6" }) }), _jsx("span", { className: "text-lg font-medium", children: "Payment Failed" }), _jsx("span", { className: "text-sm text-gray-600", children: "Please try again" })] }) }) }));
    }
    return (_jsxs("div", { className: "w-full", children: [_jsx("div", { className: "flex justify-between mb-4", children: visibleSteps.map((step, index) => (_jsxs("div", { className: cn('flex flex-col items-center flex-1', index <= visibleCurrentIndex ? 'text-blue-600' : 'text-gray-400'), children: [_jsx("div", { className: cn('w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300', index <= visibleCurrentIndex
                                ? 'bg-blue-600 text-white shadow-lg scale-110'
                                : 'bg-gray-200', index === visibleCurrentIndex && currentStep === 'processing' && 'animate-spin'), children: React.createElement(step.icon, {
                                className: cn("w-6 h-6", index === visibleCurrentIndex && currentStep === 'processing' && "animate-spin")
                            }) }), _jsx("span", { className: cn("text-sm font-medium", index <= visibleCurrentIndex ? 'text-blue-600' : 'text-gray-500'), children: step.label })] }, step.id))) }), _jsx("div", { className: "relative h-3 bg-gray-200 rounded-full overflow-hidden", children: _jsx("div", { className: cn("absolute h-full rounded-full transition-all duration-500 ease-out", "bg-gradient-to-r from-blue-500 to-blue-600"), style: {
                        width: `${Math.max(0, (visibleCurrentIndex / (visibleSteps.length - 1)) * 100)}%`,
                    } }) })] }));
}
