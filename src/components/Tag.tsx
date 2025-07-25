import "../styles/tag.css"
import Image from "next/image"
import TagIcon from "@/assets/tag.png"

export default function Tag(props) {
    return (
        <div className="tag">
            <Image alt="background" src={TagIcon} className="tag-icon"/>
            <p className="tag-text text-xs">{props.name}</p>
        </div>
    )
}