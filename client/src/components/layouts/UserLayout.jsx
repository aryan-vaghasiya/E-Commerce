import NavBar from "../NavBar"
import { Outlet } from "react-router"

function UserLayout() {
    return (
        <>
            <NavBar />
            <Outlet />
        </>
    )
}

export default UserLayout
