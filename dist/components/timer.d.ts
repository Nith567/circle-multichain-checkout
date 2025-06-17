interface TimerProps {
    isRunning: boolean;
    onTick?: (seconds: number) => void;
    initialSeconds?: number;
}
export declare function Timer({ isRunning, onTick }: TimerProps): import("react/jsx-runtime").JSX.Element;
export {};
