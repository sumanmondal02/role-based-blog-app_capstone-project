import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router";
import { loadingClass, errorClass, emptyStateClass } from "../styles/common";
import { toast } from "react-hot-toast";

function AdminAuthorArticles() {
    const { authorId } = useParams();
    const navigate = useNavigate();
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchArticles = async () => {
            setLoading(true);
            try {
                const res = await axios.get(
                    `${import.meta.env.VITE_URL}/admin-api/authors/${authorId}/articles`,
                    { withCredentials: true }
                );
                setArticles(res.data.payload);
            } catch(err) {
                setError(err.response?.data?.message || "Failed to fetch articles");
            } finally {
                setLoading(false);
            }
        };
        fetchArticles();
    }, [authorId]);

    const toggleArticle = async (article) => {
        const newStatus = !article.isArticleActive;
        const msg = newStatus ? "Restore this article?" : "Delete this article?";
        if (!window.confirm(msg)) return;

        try {
            const res = await axios.patch(
                `${import.meta.env.VITE_URL}/admin-api/articles/${article._id}`,
                { isArticleActive: newStatus },
                { withCredentials: true }
            );
            setArticles(prev => prev.map(a =>
                a._id === article._id ? res.data.payload : a
            ));
            toast.success(res.data.message);
        } catch(err) {
            toast.error("Failed to update article");
        }
    };

    const formatDate = (date) => new Date(date).toLocaleDateString("en-IN", {
        timeZone: "Asia/Kolkata", dateStyle: "medium"
    });

    if (loading) return <p className={loadingClass}>Loading articles...</p>;
    if (error) return <p className={errorClass}>{error}</p>;

    return (
        <div>
            <button
                onClick={() => navigate("/admin-profile/authors")}
                className="text-sm text-[#0066cc] hover:text-[#004499] mb-6 flex items-center gap-1"
            >
                ← Back to Authors
            </button>

            {articles.length === 0 ? (
                <p className={emptyStateClass}>This author has no articles.</p>
            ) : (
                <div className="flex flex-col gap-4">
                    <p className="text-sm text-[#6e6e73]">{articles.length} article{articles.length !== 1 ? "s" : ""}</p>

                    {articles.map(article => (
                        <div key={article._id} className="bg-[#f5f5f7] rounded-2xl p-5 hover:bg-[#ebebf0] transition">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-semibold text-[#0066cc] uppercase tracking-widest">
                                            {article.category}
                                        </span>
                                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                            article.isArticleActive
                                                ? "bg-[#34c759]/10 text-[#248a3d]"
                                                : "bg-[#ff3b30]/10 text-[#cc2f26]"
                                        }`}>
                                            {article.isArticleActive ? "ACTIVE" : "DELETED"}
                                        </span>
                                    </div>
                                    <p className="text-sm font-semibold text-[#1d1d1f] mb-1">{article.title}</p>
                                    <p className="text-xs text-[#6e6e73]">{article.content.slice(0, 80)}...</p>
                                    <p className="text-xs text-[#a1a1a6] mt-1">{formatDate(article.createdAt)}</p>
                                </div>

                                <button
                                    onClick={() => toggleArticle(article)}
                                    className={`text-xs font-medium px-3 py-1.5 rounded-full transition shrink-0 ${
                                        article.isArticleActive
                                            ? "bg-[#ff3b30]/10 text-[#cc2f26] hover:bg-[#ff3b30]/20"
                                            : "bg-[#34c759]/10 text-[#248a3d] hover:bg-[#34c759]/20"
                                    }`}
                                >
                                    {article.isArticleActive ? "Delete" : "Restore"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default AdminAuthorArticles;