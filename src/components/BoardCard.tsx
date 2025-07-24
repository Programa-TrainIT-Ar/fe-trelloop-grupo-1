import "../styles/board-card.css"
import '@fortawesome/fontawesome-free/css/all.min.css';
import Image from "next/image";
import Member from "@/assets/member.png"
import Tag from "./Tag";
import clsx from "clsx"
import { fixDescriptionLength } from "@/controllers/boardCardController";
import { ExpandedBoardCard } from "./ExpandedBoardCard";
import { useBoardStore } from "@/store/boards";

export function BoardCard(props) {
    const expandBoard = useBoardStore((state) => state.expandBoard);
    const expandedBoardID = useBoardStore((state) => state.expandedBoardID)


    return (
        <>
        {
        expandedBoardID === props.id
        ?
        <ExpandedBoardCard index={props.index}/>
        :
        <div className="card-size flex-col items-center mb-5">
            <div className="board-card p-4 text-white flex flex-col justify-between">
            
                <Image
                    src={props.image}
                    className="background-card-image"
                    alt="Imagen desde S3"
                    layout="fill"
                    objectFit="cover"
                />

                <div className="board-info"></div>
                <div className="z-10">
                    <div className="flex justify-between pe-2 items-center">
                        <p className="board-title ">{props.name}</p>
                        <button className="fav-icon"><i className="fa-regular fa-heart board-description"></i></button>
                    </div>
                    <p className="text-sm mb-1 font-normal board-description">
                    {
                        props.description.length > 27
                        ?
                        fixDescriptionLength(props.description) + "..."
                        :
                        props.description

                    }
                    </p>
                    <div className="flex relative">
                        {
                            props.members.length > 0 &&
                            props.members.map((item, index) => {
                                if (index <= 3) {
                                    return (

                                        <Image key={item.id} src={Member} alt="miembro" className={clsx(
                                            "member-icon",
                                            {
                                                "member-1": index == 0,
                                                "member-2": index == 1,
                                                "member-3": index == 2,
                                                "member-4": index == 3
                                            }

                                        )}
                                        />
                                    )
                                }
                                else if (index == 4) {
                                    return (
                                    <div className="member-icon other-members">
                                        {props.members.length}
                                    </div>
                                    )                               
                                }

                            
                            }
                            
                            )
                        }
                    </div>

                </div>

                <div className="flex justify-between z-10">
                    <button className="card-button"><i className="fa-solid fa-ellipsis-vertical"></i></button>
                    <button className="card-button" onClick={() => expandBoard(props.id)}>
                        <i className="fa-regular fa-eye"></i>
                    </button>
                    <button className="access-card-button">Ingresar</button>
                </div>
            </div>
            <div className="flex tag-container-width">
                <Tag />
                <div className="relative">
                    <div className="tags-count">{props.tags?.length}</div>
                </div>
            </div>
        </div>
        }
        </>
    )
}