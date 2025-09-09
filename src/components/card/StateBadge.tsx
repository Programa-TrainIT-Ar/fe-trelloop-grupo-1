import clsx from "clsx";

type StateLevel = string;

interface StateBadgeProps {
    label: StateLevel;
    labelsMap: Record<string, string>;
    colorsMap: Record<string, string>;
}

export default function StateBadge({ label, labelsMap, colorsMap }: StateBadgeProps) {    
    const translatedLabel = labelsMap[label] || label;    
    const backgroundColorClass = colorsMap[label] || 'bg-gray-500';

    return (
        <span
            className={clsx(
                "inline-block px-4 py-1 rounded-lg text-white text-sm mb-5 mt-2",
                backgroundColorClass
            )}
        >
            {translatedLabel}
        </span>
    );
}