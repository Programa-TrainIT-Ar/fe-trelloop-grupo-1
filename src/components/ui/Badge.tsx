interface BadgeProps {
    label: string;
    color: string;
    className?: string;
}

export default function Badge({ label, color, className = "" }: BadgeProps) {
    return (
        <span 
            className={`inline-block px-4 py-1 rounded-lg text-white text-sm ${className}`}
            style={{ backgroundColor: color }}
        >
            {label}
        </span>
    );
}