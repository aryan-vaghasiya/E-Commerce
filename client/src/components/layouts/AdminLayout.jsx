import AdminNavBar from "../AdminNavbar"
import { Outlet } from "react-router"

function AdminLayout() {
    return (
        <>
            <AdminNavBar />
            <Outlet />
        </>
    )
}

export default AdminLayout
