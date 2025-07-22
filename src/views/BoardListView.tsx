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

    const getBoards = useBoardStore(state => state.getBoards);
    const token = useAuthStore.getState().accessToken
    const boards = useBoardStore.getState().boards
    const router = useRouter()
    
    
    async function handleGetBoards() {
        try {
            const data = await getBoards()
            console.log(boards)
        } catch (error) {
            return error
        }
      
    }
    useEffect(() => {
        console.log(token)
        if (!token) {
            router.push("/")
        }
        handleGetBoards()

    }, [])

    return (
        <div className="grid grid-cols-3 md:grid-cols-4">
            {
                boards.length > 0 &&
                boards.map((board) => (
                <BoardCard 
                key={board.id} 
                name={board.name} 
                description={board.description} 
                image={board.image}
                members={board.members}
                />
            ))
            
            }
        </div>
    )
}

export default BoardListView