import BoardListView from "@/views/BoardListView"
import CreateBoardBar from "@/components/User/createBoardBar"

export default function Page() {
    return (
        <>
            <CreateBoardBar />
            <BoardListView />
        </>
    )
}