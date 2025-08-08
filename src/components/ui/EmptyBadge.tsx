interface EmptyBadgeProps {
    text: string;
}

export default function EmptyBadge({ text }: EmptyBadgeProps) {
    return (
        <span className="inline-block px-4 py-1 rounded-lg text-white text-sm bg-gray-500">
            {text}
        </span>
    );
}