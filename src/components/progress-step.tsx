"use client";

import React from 'react';
import { cn } from "../lib/utils";

const steps = [
  { id: 'idle', label: 'Ready' },
  { id: 'approving', label: 'Approving' },
  { id: 'burning', label: 'Burning' },
  { id: 'waiting-attestation', label: 'Waiting' },
  { id: 'minting', label: 'Minting' },
  { id: 'completed', label: 'Complete' },
  { id: 'error', label: 'Error' },
] as const;

type Step = typeof steps[number]['id'];

interface ProgressStepsProps {
  currentStep: Step;
}

export function ProgressSteps({ currentStep }: ProgressStepsProps) {
  const currentIndex = steps.findIndex((step) => step.id === currentStep);

  return (
    <div className="w-full">
      <div className="flex justify-between mb-2">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={cn(
              'flex flex-col items-center',
              index <= currentIndex ? 'text-blue-600' : 'text-gray-400'
            )}
          >
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center mb-1',
                index <= currentIndex ? 'bg-blue-600 text-white' : 'bg-gray-200'
              )}
            >
              {index + 1}
            </div>
            <span className="text-sm">{step.label}</span>
          </div>
        ))}
      </div>
      <div className="relative h-2 bg-gray-200 rounded-full">
        <div
          className="absolute h-full bg-blue-600 rounded-full transition-all duration-300"
          style={{
            width: `${(currentIndex / (steps.length - 1)) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}