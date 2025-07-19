import "../styles/tag.css"
import Image from "next/image"
import TagIcon from "@/assets/images/tag.png"

export default function Tag() {
    return (
        <div className="tag">
            <Image alt="background" src={TagIcon} className="tag-icon"/>
            <p className="text-xs">Etiqueta</p>
        </div>
    )
}