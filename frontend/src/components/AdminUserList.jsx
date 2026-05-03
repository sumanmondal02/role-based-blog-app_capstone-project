import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { loadingClass, errorClass, emptyStateClass } from "../styles/common";
import { toast } from "react-hot-toast";

function AdminUserList() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const res = await axios.get(
                    `${import.meta.env.VITE_URL}/admin-api/users`,
                    { withCredentials: true }
                );
                setUsers(res.data.payload.filter(u => u.role === "user"));
            } catch(err) {
                setError(err.response?.data?.message || "Failed to fetch users");
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const toggleBlock = async (user) => {
        const newStatus = !user.isUserActive;
        const confirmMsg = newStatus ? `Unblock ${user.firstName}?` : `Block ${user.firstName}?`;
        if (!window.confirm(confirmMsg)) return;

        try {
            const res = await axios.patch(
                `${import.meta.env.VITE_URL}/admin-api/block-user/${user._id}`,
                { isUserActive: newStatus },
                { withCredentials: true }
            );
            setUsers(prev => prev.map(u =>
                u._id === user._id ? res.data.payload : u
            ));
            toast.success(res.data.message);
        } catch(err) {
            toast.error("Failed to update status");
        }
    };

    const formatDate = (date) => new Date(date).toLocaleDateString("en-IN", {
        timeZone: "Asia/Kolkata", dateStyle: "medium"
    });

    if (loading) return <p className={loadingClass}>Loading users...</p>;
    if (error) return <p className={errorClass}>{error}</p>;
    if (users.length === 0) return <p className={emptyStateClass}>No users found.</p>;

    return (
        <div className="flex flex-col gap-4">
            <p className="text-sm text-[#6e6e73]">{users.length} user{users.length !== 1 ? "s" : ""} registered</p>

            {users.map(user => (
                <div key={user._id} className="bg-[#f5f5f7] rounded-2xl p-5 flex items-center justify-between hover:bg-[#ebebf0] transition">
                    <div className="flex items-center gap-4">
                        {user.profileImageUrl ? (
                            <img src={user.profileImageUrl} className="w-12 h-12 rounded-full object-cover" alt="" />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-[#0066cc]/10 text-[#0066cc] flex items-center justify-center text-lg font-semibold">
                                {user.firstName?.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div>
                            <p className="text-sm font-semibold text-[#1d1d1f]">
                                {user.firstName} {user.lastName}
                                {!user.isUserActive && (
                                    <span className="ml-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#ff3b30]/10 text-[#cc2f26]">
                                        BLOCKED
                                    </span>
                                )}
                            </p>
                            <p className="text-xs text-[#6e6e73]">{user.email}</p>
                            <p className="text-xs text-[#a1a1a6]">Joined {formatDate(user.createdAt)}</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => navigate(`/admin-profile/users/${user._id}/comments`)}
                            className="text-xs text-[#0066cc] hover:text-[#004499] font-medium px-3 py-1.5 rounded-full border border-[#0066cc]/30 hover:border-[#0066cc] transition"
                        >
                            View Comments
                        </button>
                        <button
                            onClick={() => toggleBlock(user)}
                            className={`text-xs font-medium px-3 py-1.5 rounded-full transition ${
                                user.isUserActive
                                    ? "bg-[#ff3b30]/10 text-[#cc2f26] hover:bg-[#ff3b30]/20"
                                    : "bg-[#34c759]/10 text-[#248a3d] hover:bg-[#34c759]/20"
                            }`}
                        >
                            {user.isUserActive ? "Block" : "Unblock"}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default AdminUserList;