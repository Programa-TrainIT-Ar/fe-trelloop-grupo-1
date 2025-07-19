"use client"
import { BoardCard } from "@/components/BoardCard"
import { useState, useEffect } from "react"
import { getBoardList } from "@/services/boardListService"
import { StaticImageData } from "next/image"

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

    const [boards, setBoards] = useState<Board[]>([])

    useEffect(() => {
        const data = getBoardList()
        setBoards(data)

    }, [])

    return (
        <>
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
        </>
    )
}

export default BoardListView