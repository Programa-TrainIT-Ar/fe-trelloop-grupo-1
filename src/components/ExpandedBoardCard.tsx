import clsx from "clsx"
export function ExpandedBoardCard(props) {
    
    return (
        
        <div className={clsx(
        "border board-card col-span-3",
        {
            "col-start-2 col-end-4": props.index == (1 || 2 || 5 || 6 || 9 || 10 || 13 || 14 || 17 || 18 || 21 || 22 || 25 || 26),
            "col-start-3 col-end-5": props.index == (3 || 4 || 7 || 8 || 11 || 12 || 15 || 16 || 19 || 20 ||23 || 24 || 27 || 28))

        }
        )}></div>

    )
}