import "../../styles/board-card.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Image from "next/image";
import Member from "@/assets/member.png";
import Tag from "@/components/common/Tag";
import clsx from "clsx";
import { fixDescriptionLength } from "@/lib/boardCardController";
import BoardMenu from "@/components/board/BoardMenu";
import { useRouter } from "next/navigation";

interface MemberType {
  id: string;
}

interface BoardCardProps {
  id: string;
  name: string;
  description: string;
  image: string;
  members: MemberType[];
  creatorId: string;
  currentUserId: string;
}
import { ExpandedBoardCard } from "./ExpandedBoardCard";
import { useBoardStore } from "@/store/boards";

export function BoardCard(props) {
  const expandBoard = useBoardStore((state) => state.expandBoard);
  const expandedBoardID = useBoardStore((state) => state.expandedBoardID);
  const router = useRouter();

  const handleViewBoard = () => {
    router.push(`/dashboard/boards/${props.id}`);
  };

  return (
    <>
      {expandedBoardID === props.id ? (
        <ExpandedBoardCard
          image={props.image}
          name={props.name}
          description={props.description}
          tags={props.tags}
          members={props.members}
        />
      ) : (
        <div className="card-size flex-col items-center mb-5">
          <div className="board-card p-5 text-white flex flex-col justify-between">
            <Image
              src={props.image}
              className="background-card-image"
              alt="Imagen de tablero"
              layout="fill"
              objectFit="cover"
            />

            <div className="board-info"></div>
            <div className="z-10">
              <div className="flex justify-between pe-2 items-center">
                <p className="board-title ">{props.name}</p>
                <button className="bg-transparent">
                  <i className=" fav-icon fa-regular fa-heart board-description"></i>
                </button>
              </div>
              <p className="text-sm mb-1 font-normal board-description">
                {props.description.length > 27
                  ? fixDescriptionLength(props.description) + "..."
                  : props.description}
              </p>
              <div className="flex relative">
                {props.members?.length > 0 &&
                  props.members?.map((item, index) => {
                    if (index <= 3) {
                      return (
                        <Image
                          key={index}
                          src={Member}
                          alt="miembro"
                          className={clsx("member-icon", {
                            "member-1": index == 0,
                            "member-2": index == 1,
                            "member-3": index == 2,
                            "member-4": index == 3,
                          })}
                        />
                      );
                    } else if (index == 4) {
                      return (
                        <div key={index} className="member-icon other-members">
                          {props.members.length}
                        </div>
                      );
                    }
                  })}
              </div>
            </div>

            <div className="flex justify-between z-10">
              <div className="card-button">
                <BoardMenu
                  creatorId={props.creatorId}
                  currentUserId={props.currentUserId}
                  boardId={props.id}
                  boardName={props.name}
                />
              </div>
              <button className="card-button" onClick={() => expandBoard(props.id)}>
                <i className="fa-regular fa-eye"></i>
              </button>
              <button
               onClick={handleViewBoard}
               className="access-card-button">Ingresar</button>
            </div>
          </div>
          <div className="flex tag-container-width">
            <Tag name="Etiqueta" />
            <div className="relative">
              <div className="tags-count">{props.tags?.length || "0"}</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
