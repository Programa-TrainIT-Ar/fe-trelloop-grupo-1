import "@/styles/board-card.css"
import Image from "next/image"
import BoardMenu from "./BoardMenu"
import Tag from "./Tag"

export function ExpandedBoardCard(props) {
    
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
                                <i className="fa-regular fa-eye"></i>
                            </button>
                            <button className="access-card-button">Ingresar</button>
                        </div>
                    </div>
                </div>
                <div className="h-1/4 my-3 mx-3 text-white">
                    <p className="board-description">{props.description}</p>
                </div>
                <div className="h-1/4 border flex flex-col mx-3 tags-section">
                    {/* <div className="flex gap-3">
                    {
                        props.tags?.length > 0 &&
                        props.tags?.map((tag, index) => {
                            if (index <= 4) {
                                return (
                                    <Tag/>
                                )
                            }
                        }
                        )
                    
                        }
                    </div>
                       <div className="flex gap-3">
                    {
                        props.tags?.length > 0 &&
                        props.tags?.map((tag, index) => {
                            if (index >= 4 && index <= 8) {
                                return (
                                    <Tag/>
                                )
                            }
                        }
                        )
                    
                        }
                    </div> */}
                </div>
            </div>
            <div className="members-section">

            </div>
        </div>

    )
}