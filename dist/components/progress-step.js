"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { cn } from "../lib/utils";
import { CreditCard, Loader2, CheckCircle2, XCircle, Shield } from "lucide-react";
const steps = [
    { id: "idle", label: "Ready", icon: CreditCard },
    { id: "processing", label: "Processing", icon: Loader2 },
    { id: "confirming", label: "Confirming", icon: Shield },
    { id: "completed", label: "Complete", icon: CheckCircle2 },
    { id: "error", label: "Error", icon: XCircle },
];
export function ProgressSteps({ currentStep }) {
    const isError = currentStep === "error";
    const visibleSteps = steps.filter((s) => s.id !== "error");
    const currentIndex = visibleSteps.findIndex((s) => s.id === currentStep);
    if (isError) {
        return (_jsxs("div", { className: "w-full flex flex-col items-center text-red-600", children: [_jsx("div", { className: "w-12 h-12 rounded-full flex items-center justify-center mb-2 bg-red-100", children: _jsx(XCircle, { className: "w-6 h-6" }) }), _jsx("span", { className: "text-lg font-semibold", children: "Payment Failed" }), _jsx("span", { className: "text-sm text-gray-500 mb-3", children: "Please try again" }), _jsx("button", { className: "px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition", children: "Retry" })] }));
    }
    return (_jsx("div", { className: "w-full", children: _jsxs("div", { className: "relative flex justify-between items-center", children: [_jsx("div", { className: "absolute top-4 left-0 right-0 h-0.5 bg-gray-200 -z-10", children: _jsx("div", { className: "h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500", style: {
                            width: `${(currentIndex / (visibleSteps.length - 1)) * 100}%`,
                        } }) }), visibleSteps.map((step, index) => (_jsxs("div", { className: "flex flex-col items-center flex-1", children: [_jsx("div", { className: cn("w-8 h-8 rounded-full flex items-center justify-center mb-1 border-2 transition-all duration-300", index < currentIndex
                                ? "bg-green-500 border-green-500 text-white"
                                : index === currentIndex
                                    ? "bg-blue-600 border-blue-600 text-white animate-pulse"
                                    : "bg-white border-gray-300 text-gray-400"), children: index < currentIndex ? (_jsx(CheckCircle2, { className: "w-4 h-4" })) : (React.createElement(step.icon, {
                                className: cn("w-4 h-4", index === currentIndex &&
                                    currentStep === "processing" &&
                                    "animate-spin"),
                            })) }), _jsx("span", { className: cn("text-xs font-medium", index < currentIndex
                                ? "text-green-600"
                                : index === currentIndex
                                    ? "text-blue-600 font-semibold"
                                    : "text-gray-500"), children: step.label })] }, step.id)))] }) }));
}
