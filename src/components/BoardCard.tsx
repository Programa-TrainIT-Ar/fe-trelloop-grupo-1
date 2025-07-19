import "../styles/board-card.css"
import '@fortawesome/fontawesome-free/css/all.min.css';
import Image from "next/image";
import Background from "@/assets/images/background-card-image.png"
import Member from "@/assets/images/member.png"
import Tag from "./Tag";

export function BoardCard() {
    return (
        <>
            <div className="board-card p-4 text-white flex flex-col justify-between">
                <Image alt="background" src={Background} className="background-card-image"/>
                <div className="board-info"></div>
                <div className="z-10">
                    <div className="flex justify-between pe-2 items-center">
                        <p className="text-base font-medium">Título tablero</p>
                        <button className="fav-icon"><i className="fa-regular fa-heart"></i></button>
                    </div>
                    <p className="text-sm mb-1 font-normal">Descripción breve del tablero...</p>
                    <div className="flex relative">
                        <Image className="member-icon member-1" src={Member} alt="miembro"/>
                        <Image className="member-icon member-2" src={Member} alt="miembro"/>
                        <Image className="member-icon member-3" src={Member} alt="miembro"/>
                        <Image className="member-icon member-4" src={Member} alt="miembro"/>
                        <div className="member-icon other-members">7</div>
                    </div>

                </div>

                <div className="flex justify-between z-10">
                    <button className="card-button"><i className="fa-solid fa-ellipsis-vertical"></i></button>
                    <button className="card-button"><i className="fa-regular fa-eye"></i></button>
                    <button className="access-card-button">Ingresar</button>
                </div>
            </div>
            <div className="flex">
                <Tag/>
                <div className="relative">
                    <div className="tags-count">0</div>
                </div>
            </div>
        </>
    )
}