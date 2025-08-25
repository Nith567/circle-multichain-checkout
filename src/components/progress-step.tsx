"use client";

import React from 'react';
import { cn } from "../lib/utils";
import { CreditCard, Loader2, CheckCircle2, XCircle, ArrowRight } from "lucide-react";

const steps = [
  { id: 'idle', label: 'Ready', icon: CreditCard },
  { id: 'processing', label: 'Processing', icon: Loader2 },
  { id: 'confirming', label: 'Confirming', icon: ArrowRight },
  { id: 'completed', label: 'Complete', icon: CheckCircle2 },
  { id: 'error', label: 'Error', icon: XCircle },
] as const;

type Step = typeof steps[number]['id'];

interface ProgressStepsProps {
  currentStep: Step;
}

export function ProgressSteps({ currentStep }: ProgressStepsProps) {
  const currentIndex = steps.findIndex((step) => step.id === currentStep);
  const isError = currentStep === 'error';

  // Don't show error in the normal flow
  const visibleSteps = steps.filter(step => step.id !== 'error');
  const visibleCurrentIndex = currentStep === 'error' ? -1 : visibleSteps.findIndex((step) => step.id === currentStep);

  if (isError) {
    return (
      <div className="w-full">
        <div className="flex justify-center mb-4">
          <div className="flex flex-col items-center text-red-600">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2 bg-red-100">
              <XCircle className="w-6 h-6" />
            </div>
            <span className="text-lg font-medium">Payment Failed</span>
            <span className="text-sm text-gray-600">Please try again</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between mb-4">
        {visibleSteps.map((step, index) => (
          <div
            key={step.id}
            className={cn(
              'flex flex-col items-center flex-1',
              index <= visibleCurrentIndex ? 'text-blue-600' : 'text-gray-400'
            )}
          >
            <div
              className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300',
                index <= visibleCurrentIndex 
                  ? 'bg-blue-600 text-white shadow-lg scale-110' 
                  : 'bg-gray-200',
                index === visibleCurrentIndex && currentStep === 'processing' && 'animate-spin'
              )}
            >
              {React.createElement(step.icon, { 
                className: cn(
                  "w-6 h-6",
                  index === visibleCurrentIndex && currentStep === 'processing' && "animate-spin"
                )
              })}
            </div>
            <span className={cn(
              "text-sm font-medium",
              index <= visibleCurrentIndex ? 'text-blue-600' : 'text-gray-500'
            )}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn(
            "absolute h-full rounded-full transition-all duration-500 ease-out",
            "bg-gradient-to-r from-blue-500 to-blue-600"
          )}
          style={{
            width: `${Math.max(0, (visibleCurrentIndex / (visibleSteps.length - 1)) * 100)}%`,
          }}
        />
      </div>
    </div>
  );
}