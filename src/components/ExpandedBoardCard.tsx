import "@/styles/board-card.css"
import Image from "next/image"
import BoardMenu from "./BoardMenu"
import Tag from "./Tag"
import Member from "@/assets/member.png"
import { useBoardStore } from "@/store/boards"
import { PiEyeClosedBold } from "react-icons/pi"

export function ExpandedBoardCard(props) {
    
    const expandBoard = useBoardStore((state) => state.expandBoard);

    return (
        
        <div className=" w-full board-card expanded-board-card col-span-3 flex justify-between">
            <div className="expanded-board-info">
              
                <div className="relative w-full h-1/4 rounded-2xl flex items-center px-4">
               
                    <Image 
                    src={props.image}
        
                    className="absolute rounded-2xl"
                    alt="Banner del tablero"
                    layout="fill"
                    objectFit="cover"
                    />
                    <div className="flex items-center justify-between w-full">
                        <p className="z-10 board-title text-white">{props.name}</p>
                        <div className="z-10 flex gap-5 text-white">
                            <div className="card-button">
                                <BoardMenu
                                    creatorId={props.creatorId}
                                    currentUserId={props.currentUserId}
                                    boardId={props.id}
                                    boardName={props.name}
                                />
                            </div>
                            <button className="card-button">
                                <PiEyeClosedBold onClick={() => expandBoard(null)} />
                            </button>
                            <button className="access-card-button">Ingresar</button>
                        </div>
                    </div>
                </div>
                <div className="h-1/4 my-4 mx-3 text-white">
                    <p className="board-description">{props.description}</p>
                </div>
                <div className="h-1/4 mx-3 tags-section">
                    <div className="flex gap-3 mb-3">
                    {
                        props.tags?.length > 0 &&
                        props.tags?.map((tag, index) => {
                            if (index <= 3) {
                                return (
                                    <div key={index}>
                                        <Tag name={tag.name} key={index} />
                                    </div>
                                )
                            }
                        }
                        )
                    
                        }
                    </div>
                       <div className="flex gap-3 w">
                    {
                        props.tags?.length > 0 &&
                        props.tags?.map((tag, index) => {
                            if (index >= 4 && index <= 8) {
                                return (
                                    <Tag name={tag.name} key={index}/>
                                )
                            }
                        }
                        )
                    
                        }
                    </div>
                </div>
            </div>
            <div className="flex members-section-size p-3">
                <div className="members-section w-full">
                    {
                        props.members?.map((member) => (
                            <div className="flex items-center text-white gap-2 h-16">
                                <Image className="member-icon-expanded" src={Member} alt="miembro" width={5} height={5}/>
                                <p className="member-name">{member.firstName} {member.lastName}</p>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>

    )
}