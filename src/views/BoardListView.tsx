"use client"
import { BoardCard } from "@/components/BoardCard"
import { useState, useEffect } from "react"
import { StaticImageData } from "next/image"
import { useBoardStore } from "@/store/boards/store"
import { useAuthStore } from "@/store/auth"
import { useRouter } from "next/navigation"

interface Board {
    id: number
    name: string
    description: string
    image: StaticImageData
    creationDate: string
    userId: number
    members: object[]
    isPublic: boolean
}

const BoardListView = () => { 

    const getBoards = useBoardStore((state) => state.getBoards);
    const token = useAuthStore.getState().accessToken
    const boards = useBoardStore((state) => state.boards);
    const router = useRouter()
    

    useEffect(() => {
        console.log(token)
        if (!token) {
            router.push("/")
        }
        getBoards()

        console.log(boards, "rerender")

    }, [])

    return (
        <>

        <div className="grid grid-cols-4 grid-flow-dense gap-8">
            {
                boards?.length > 0 &&
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
                />
            ))
            
            }
        </div>

        </>
    )
}

export default BoardListView