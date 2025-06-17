"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
export function TransferTypeSelector({ value, onChange, }) {
    return (_jsx(Tabs, { value: value, onValueChange: (v) => onChange(v), children: _jsxs(TabsList, { className: "grid w-full grid-cols-2", children: [_jsx(TabsTrigger, { value: "fast", children: "\uD83D\uDE80 V2 Fast" }), _jsx(TabsTrigger, { value: "standard", children: "\uD83D\uDEE1\uFE0F V1 Standard" })] }) }));
}
