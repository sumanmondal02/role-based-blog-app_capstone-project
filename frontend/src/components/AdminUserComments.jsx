import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router";
import { loadingClass, errorClass, emptyStateClass } from "../styles/common";
import { toast } from "react-hot-toast";

function AdminUserComments() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchComments = async () => {
            setLoading(true);
            try {
                const res = await axios.get(
                    `${import.meta.env.VITE_URL}/admin-api/user/${userId}/comments`,
                    { withCredentials: true }
                );
                setComments(res.data.payload);
            } catch(err) {
                setError(err.response?.data?.message || "Failed to fetch comments");
            } finally {
                setLoading(false);
            }
        };
        fetchComments();
    }, [userId]);

    const deleteComment = async (articleId, commentIndex) => {
        if (!window.confirm("Delete this comment?")) return;
        try {
            await axios.delete(
                `${import.meta.env.VITE_URL}/admin-api/comment`,
                {
                    data: { articleId, commentIndex },
                    withCredentials: true
                }
            );
            setComments(prev => prev.filter((_, i) => i !== prev.findIndex(
                c => c.articleId === articleId && c.commentIndex === commentIndex
            )));
            toast.success("Comment deleted");
        } catch(err) {
            toast.error("Failed to delete comment");
        }
    };

    const formatDate = (date) => new Date(date).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short"
    });

    if (loading) return <p className={loadingClass}>Loading comments...</p>;
    if (error) return <p className={errorClass}>{error}</p>;

    return (
        <div>
            <button
                onClick={() => navigate("/admin-profile/users")}
                className="text-sm text-[#0066cc] hover:text-[#004499] mb-6 flex items-center gap-1"
            >
                ← Back to Users
            </button>

            {comments.length === 0 ? (
                <p className={emptyStateClass}>This user has no comments.</p>
            ) : (
                <div className="flex flex-col gap-4">
                    <p className="text-sm text-[#6e6e73]">{comments.length} comment{comments.length !== 1 ? "s" : ""}</p>

                    {comments.map((item, i) => (
                        <div key={i} className="bg-[#f5f5f7] rounded-2xl p-5 hover:bg-[#ebebf0] transition">
                            <p className="text-[10px] font-semibold text-[#0066cc] uppercase tracking-widest mb-2">
                                {item.articleTitle}
                            </p>
                            <p className="text-sm text-[#1d1d1f] leading-relaxed mb-3">
                                {item.comment}
                            </p>
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-[#a1a1a6]">{formatDate(item.createdAt)}</p>
                                <button
                                    onClick={() => deleteComment(item.articleId, item.commentIndex)}
                                    className="text-xs text-[#ff3b30] hover:text-[#d62c23] font-medium transition"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default AdminUserComments;