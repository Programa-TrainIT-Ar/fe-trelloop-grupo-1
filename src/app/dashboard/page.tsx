import BoardListView from "@/components/BoardListView"
import CreateBoardBar from "@/components/User/createBoardBar"

export default function Page() {
    return (
        <>
            <CreateBoardBar />
            <BoardListView />
        </>
    )
}