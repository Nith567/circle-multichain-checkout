declare const steps: readonly [{
    readonly id: "idle";
    readonly label: "Ready";
}, {
    readonly id: "approving";
    readonly label: "Approving";
}, {
    readonly id: "burning";
    readonly label: "Burning";
}, {
    readonly id: "waiting-attestation";
    readonly label: "Waiting";
}, {
    readonly id: "minting";
    readonly label: "Minting";
}, {
    readonly id: "completed";
    readonly label: "Complete";
}, {
    readonly id: "error";
    readonly label: "Error";
}];
type Step = typeof steps[number]['id'];
interface ProgressStepsProps {
    currentStep: Step;
}
export declare function ProgressSteps({ currentStep }: ProgressStepsProps): import("react/jsx-runtime").JSX.Element;
export {};
