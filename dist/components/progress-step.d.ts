import React from "react";
declare const steps: readonly [{
    readonly id: "idle";
    readonly label: "Ready";
    readonly icon: React.ForwardRefExoticComponent<Omit<import("lucide-react").LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
}, {
    readonly id: "processing";
    readonly label: "Processing";
    readonly icon: React.ForwardRefExoticComponent<Omit<import("lucide-react").LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
}, {
    readonly id: "confirming";
    readonly label: "Confirming";
    readonly icon: React.ForwardRefExoticComponent<Omit<import("lucide-react").LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
}, {
    readonly id: "completed";
    readonly label: "Complete";
    readonly icon: React.ForwardRefExoticComponent<Omit<import("lucide-react").LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
}, {
    readonly id: "error";
    readonly label: "Error";
    readonly icon: React.ForwardRefExoticComponent<Omit<import("lucide-react").LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
}];
type Step = typeof steps[number]["id"];
interface ProgressStepsProps {
    currentStep: Step;
}
export declare function ProgressSteps({ currentStep }: ProgressStepsProps): import("react/jsx-runtime").JSX.Element;
export {};
