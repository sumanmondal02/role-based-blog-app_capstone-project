import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { useAuth } from "../store/authStore";
import {
    tagClass,
    timestampClass,
    loadingClass,
    errorClass,
    emptyStateClass,
    ghostBtn,
    inputClass,
    commentsWrapper,
    commentCard,
    commentHeader,
    commentUserRow,
    avatar,
    commentUser,
    commentTime,
    commentText,
} from "../styles/common";

function HomeComp() {
    const navigate = useNavigate();
    const user = useAuth((state) => state.currentUser);

    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [expandedId, setExpandedId] = useState(null);
    const [commentInputs, setCommentInputs] = useState({});

    useEffect(() => {
        const fetchArticles = async () => {
            setLoading(true);
            try {
                const res = await axios.get(
                    `${import.meta.env.VITE_URL}/user-api/public/articles`
                );
                setArticles(res.data.payload);
            } catch(err) {
                setError("Failed to load articles");
            } finally {
                setLoading(false);
            }
        };
        fetchArticles();
    }, []);

    const formatDate = (date) => {
        return new Date(date).toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            dateStyle: "medium",
            timeStyle: "short",
        });
    };

    const toggleComments = (articleId) => {
        setExpandedId(expandedId === articleId ? null : articleId);
    };

    const handleCommentInput = (articleId, value) => {
        setCommentInputs(prev => ({...prev, [articleId]: value}));
    };

    const submitComment = async (articleId) => {
        const comment = commentInputs[articleId]?.trim();
        if (!comment) return;

        try {
            const res = await axios.put(
                `${import.meta.env.VITE_URL}/user-api/comment`,
                { articleId, comment },
                { withCredentials: true }
            );
            if (res.status === 200) {
                // Update the article in state with new comments
                setArticles(prev => prev.map(a =>
                    a._id === articleId ? res.data.payload : a
                ));
                setCommentInputs(prev => ({...prev, [articleId]: ""}));
            }
        } catch(err) {
            console.log("comment error", err);
        }
    };

    if (loading) return <p className={loadingClass}>Loading articles...</p>;
    if (error) return <p className={errorClass}>{error}</p>;

    return (
        <div className="max-w-3xl mx-auto px-6 py-10">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-4xl font-bold text-[#1d1d1f] tracking-tight">
                    Latest Articles
                </h1>
                <p className="text-[#6e6e73] mt-2 text-sm">
                    {articles.length} article{articles.length !== 1 ? "s" : ""} published
                </p>
            </div>

            {articles.length === 0 ? (
                <p className={emptyStateClass}>No articles published yet.</p>
            ) : (
                <div className="flex flex-col gap-6">
                    {articles.map((article) => (
                        <div key={article._id} className="border border-[#e8e8ed] rounded-2xl overflow-hidden">

                            {/* Article Card */}
                            <div className="p-7">
                                {/* Category + Date */}
                                <div className="flex items-center justify-between mb-3">
                                    <span className={tagClass}>{article.category}</span>
                                    <span className="text-xs text-[#a1a1a6]">
                                        {formatDate(article.createdAt)}
                                    </span>
                                </div>

                                {/* Title */}
                                <h2 className="text-xl font-bold text-[#1d1d1f] tracking-tight mb-2">
                                    {article.title}
                                </h2>

                                {/* Excerpt */}
                                <p className="text-sm text-[#6e6e73] leading-relaxed mb-3">
                                    {article.content.slice(0, 150)}...
                                </p>

                                {/* Author */}
                                <div className="flex items-center gap-2 mb-4">
                                    {article.author?.profileImageUrl ? (
                                        <img
                                            src={article.author.profileImageUrl}
                                            className="w-7 h-7 rounded-full object-cover"
                                            alt=""
                                        />
                                    ) : (
                                        <div className="w-7 h-7 rounded-full bg-[#0066cc]/10 text-[#0066cc] flex items-center justify-center text-xs font-semibold">
                                            {article.author?.firstName?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <p className="text-xs text-[#a1a1a6]">
                                        By {article.author?.firstName} {article.author?.lastName}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-5">
                                    <button
                                        className={ghostBtn}
                                        onClick={() => navigate(`/article/${article._id}`, {state: article})}
                                    >
                                        Read Article →
                                    </button>

                                    <button
                                        onClick={() => toggleComments(article._id)}
                                        className="text-xs text-[#6e6e73] hover:text-[#1d1d1f] transition-colors"
                                    >
                                        {expandedId === article._id
                                            ? "Hide comments ▲"
                                            : `Comments (${article.comments?.length || 0}) ▼`}
                                    </button>
                                </div>
                            </div>

                            {/* Comments Panel - expands below */}
                            {expandedId === article._id && (
                                <div className="border-t border-[#e8e8ed] bg-[#f9f9fb] px-7 py-5">

                                    {/* Add comment — only if logged in as user */}
                                    {user?.role === "user" && (
                                        <div className="flex flex-col gap-2 mb-5">
                                            <input
                                                type="text"
                                                value={commentInputs[article._id] || ""}
                                                onChange={(e) => handleCommentInput(article._id, e.target.value)}
                                                placeholder="Write a comment..."
                                                className={`${inputClass} max-w-sm`}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") submitComment(article._id);
                                                }}
                                            />
                                            <button
                                                onClick={() => submitComment(article._id)}
                                                className="bg-[#0066cc] text-white text-xs px-4 py-2 rounded-full w-fit hover:bg-[#004499] transition"
                                            >
                                                Post comment
                                            </button>
                                        </div>
                                    )}

                                    {/* Not logged in */}
                                    {!user && (
                                        <p className="text-xs text-[#a1a1a6] mb-4">
                                            <button
                                                onClick={() => navigate("/login")}
                                                className="text-[#0066cc] hover:underline"
                                            >
                                                Sign in
                                            </button>
                                            {" "}to leave a comment
                                        </p>
                                    )}

                                    {/* Comments list */}
                                    {article.comments?.length === 0 ? (
                                        <p className="text-sm text-[#a1a1a6] text-center py-4">
                                            No comments yet
                                        </p>
                                    ) : (
                                        <div className="flex flex-col gap-3">
                                            {article.comments.map((c, i) => {
                                                const name = c.user?.email || "User";
                                                const letter = name.charAt(0).toUpperCase();
                                                return (
                                                    <div key={i} className={commentCard}>
                                                        <div className={commentHeader}>
                                                            <div className={commentUserRow}>
                                                                <div className={avatar}>{letter}</div>
                                                                <div>
                                                                    <p className={commentUser}>{name}</p>
                                                                    <p className={commentTime}>
                                                                        {formatDate(c.createdAt || new Date())}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <p className={commentText}>{c.comment}</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default HomeComp;