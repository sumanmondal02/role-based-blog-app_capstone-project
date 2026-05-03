import { NavLink, Outlet, useNavigate } from "react-router";
import { useAuth } from "../store/authStore";
import { pageWrapper, navLinkClass, divider } from "../styles/common";

function AdminProfile() {
    const currentUser = useAuth((state) => state.currentUser);
    const logout = useAuth((state) => state.logout);
    const navigate = useNavigate();

    const onLogout = async () => {
        await logout();
        navigate("/login");
    };

    return (
        <div className={pageWrapper}>
            {/* Profile Header */}
            <div className="bg-white border border-[#e8e8ed] rounded-3xl p-6 mb-8 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-[#ff3b30]/10 text-[#ff3b30] flex items-center justify-center text-xl font-semibold">
                        A
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-[#ff3b30] uppercase tracking-widest">Admin</p>
                        <h2 className="text-xl font-semibold text-[#1d1d1f]">{currentUser?.firstName}</h2>
                        <p className="text-xs text-[#a1a1a6]">{currentUser?.email}</p>
                    </div>
                </div>
                <button
                    className="bg-[#ff3b30] text-white text-sm px-5 py-2 rounded-full hover:bg-[#d62c23] transition"
                    onClick={onLogout}
                >
                    Logout
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-3 mb-6 bg-[#f5f5f7] p-2 rounded-full w-fit">
                <NavLink
                    to="authors"
                    className={({ isActive }) =>
                        isActive
                            ? "bg-white px-5 py-2 rounded-full text-[#0066cc] text-sm font-medium shadow-sm"
                            : `${navLinkClass} px-5 py-2 text-sm`
                    }
                >
                    Authors
                </NavLink>
                <NavLink
                    to="users"
                    className={({ isActive }) =>
                        isActive
                            ? "bg-white px-5 py-2 rounded-full text-[#0066cc] text-sm font-medium shadow-sm"
                            : `${navLinkClass} px-5 py-2 text-sm`
                    }
                >
                    Users
                </NavLink>
            </div>

            <div className={divider} />

            <div className="mt-6">
                <Outlet />
            </div>
        </div>
    );
}

export default AdminProfile;