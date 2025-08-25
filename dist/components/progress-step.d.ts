declare const steps: readonly [{
    readonly id: "idle";
    readonly label: "Ready";
    readonly icon: "💳";
}, {
    readonly id: "processing";
    readonly label: "Processing";
    readonly icon: "🔄";
}, {
    readonly id: "confirming";
    readonly label: "Confirming";
    readonly icon: "🔍";
}, {
    readonly id: "completed";
    readonly label: "Complete";
    readonly icon: "✅";
}, {
    readonly id: "error";
    readonly label: "Error";
    readonly icon: "❌";
}];
type Step = typeof steps[number]['id'];
interface ProgressStepsProps {
    currentStep: Step;
}
export declare function ProgressSteps({ currentStep }: ProgressStepsProps): import("react/jsx-runtime").JSX.Element;
export {};
