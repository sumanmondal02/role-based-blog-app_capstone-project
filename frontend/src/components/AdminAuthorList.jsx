import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { loadingClass, errorClass, emptyStateClass } from "../styles/common";
import { toast } from "react-hot-toast";

function AdminAuthorList() {
    const navigate = useNavigate();
    const [authors, setAuthors] = useState([]);
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
                // Filter only authors
                setAuthors(res.data.payload.filter(u => u.role === "author"));
            } catch(err) {
                setError(err.response?.data?.message || "Failed to fetch authors");
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const toggleBlock = async (author) => {
        const newStatus = !author.isUserActive;
        const confirmMsg = newStatus ? `Unblock ${author.firstName}?` : `Block ${author.firstName}?`;
        if (!window.confirm(confirmMsg)) return;

        try {
            const res = await axios.patch(
                `${import.meta.env.VITE_URL}/admin-api/block-user/${author._id}`,
                { isUserActive: newStatus },
                { withCredentials: true }
            );
            setAuthors(prev => prev.map(a =>
                a._id === author._id ? res.data.payload : a
            ));
            toast.success(res.data.message);
        } catch(err) {
            toast.error("Failed to update status");
        }
    };

    const formatDate = (date) => new Date(date).toLocaleDateString("en-IN", {
        timeZone: "Asia/Kolkata", dateStyle: "medium"
    });

    if (loading) return <p className={loadingClass}>Loading authors...</p>;
    if (error) return <p className={errorClass}>{error}</p>;
    if (authors.length === 0) return <p className={emptyStateClass}>No authors found.</p>;

    return (
        <div className="flex flex-col gap-4">
            <p className="text-sm text-[#6e6e73]">{authors.length} author{authors.length !== 1 ? "s" : ""} registered</p>

            {authors.map(author => (
                <div key={author._id} className="bg-[#f5f5f7] rounded-2xl p-5 flex items-center justify-between hover:bg-[#ebebf0] transition">
                    {/* Left — avatar + info */}
                    <div className="flex items-center gap-4">
                        {author.profileImageUrl ? (
                            <img src={author.profileImageUrl} className="w-12 h-12 rounded-full object-cover" alt="" />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-[#0066cc]/10 text-[#0066cc] flex items-center justify-center text-lg font-semibold">
                                {author.firstName?.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div>
                            <p className="text-sm font-semibold text-[#1d1d1f]">
                                {author.firstName} {author.lastName}
                                {!author.isUserActive && (
                                    <span className="ml-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#ff3b30]/10 text-[#cc2f26]">
                                        BLOCKED
                                    </span>
                                )}
                            </p>
                            <p className="text-xs text-[#6e6e73]">{author.email}</p>
                            <p className="text-xs text-[#a1a1a6]">Joined {formatDate(author.createdAt)}</p>
                        </div>
                    </div>

                    {/* Right — actions */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => navigate(`/admin-profile/authors/${author._id}/articles`)}
                            className="text-xs text-[#0066cc] hover:text-[#004499] font-medium px-3 py-1.5 rounded-full border border-[#0066cc]/30 hover:border-[#0066cc] transition"
                        >
                            View Articles
                        </button>
                        <button
                            onClick={() => toggleBlock(author)}
                            className={`text-xs font-medium px-3 py-1.5 rounded-full transition ${
                                author.isUserActive
                                    ? "bg-[#ff3b30]/10 text-[#cc2f26] hover:bg-[#ff3b30]/20"
                                    : "bg-[#34c759]/10 text-[#248a3d] hover:bg-[#34c759]/20"
                            }`}
                        >
                            {author.isUserActive ? "Block" : "Unblock"}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default AdminAuthorList;