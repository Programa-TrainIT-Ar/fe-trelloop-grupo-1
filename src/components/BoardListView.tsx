"use client";
import { BoardCard } from "@/components/board/BoardCard";
import { useEffect, useState } from "react";
import { StaticImageData } from "next/image";
import { useBoardStore } from "@/store/boards/store";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";

interface Board {
  id: number;
  name: string;
  description: string;
  image: StaticImageData;
  creationDate: string;
  userId: number;
  members: object[];
  isPublic: boolean;
}

const BoardListView = () => {
  const getBoards = useBoardStore((state) => state.getBoards);
  const token = useAuthStore.getState().accessToken;
  const boards = useBoardStore((state) => state.boards);
  const router = useRouter();
  const [favoriteBoardIds, setFavoriteBoardIds] = useState<number[]>([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push("/");
    }

      getBoards()

    



    // Fetch para traer los tableros favoritos
    const fetchFavoriteBoards = async () => {
      setIsLoadingFavorites(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API}/board/getFavoriteBoards`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          const ids = data.map((board: { id: number }) => board.id);
          setFavoriteBoardIds(ids);
        } else {
          console.error("Error al obtener tableros favoritos");
        }
      } catch (error) {
        console.error("Error en la petición de tableros favoritos:", error);
      } finally {
        setIsLoadingFavorites(false);
      }
    };

    fetchFavoriteBoards();

  }, [token, router, getBoards]);

  if (isLoadingFavorites) {
    return <p className="text-white">Cargando tableros...</p>;
  }

  return (
    <>
      <div className="flex justify-between items-center mb-5">
        <p className="text-white text-2xl w-64 me-5">Tableros Creados</p>
        <div className="w-full border-b-[1px] border-b-[--global-color-neutral-700]"></div>
      </div>
      <div className="grid grid-cols-4  gap-8">
        {boards?.length > 0 &&
          boards.map((board, index) => (
            <BoardCard
              key={board.id}
              name={board.name}
              description={board.description}
              image={board.image}
              members={board.members}
              tags={board.tags}
              id={board.id}
              index={index}
              isFavorite={favoriteBoardIds.includes(board.id)}
            />
          ))}
      </div>
    </>
  );
};

export default BoardListView;
