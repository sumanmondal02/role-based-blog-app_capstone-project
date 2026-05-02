import { useAuth } from "../store/authStore";
import { useNavigate } from "react-router";
import axios from "axios";
import { useEffect, useState } from "react";
import {
    loadingClass,
    errorClass,
    ghostBtn,
    timestampClass,
} from "../styles/common.js";

function UserProfile() {
    const logout = useAuth((state) => state.logout);
    const currentUser = useAuth((state) => state.currentUser);
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [myComments, setMyComments] = useState([]);

    useEffect(() => {
        const getMyComments = async () => {
            setLoading(true);
            try {
                const res = await axios.get(
                    `${import.meta.env.VITE_URL}/user-api/my-comments`,
                    { withCredentials: true }
                );
                if (res.status === 200) {
                    setMyComments(res.data.payload);
                }
            } catch(err) {
                setError(err.response?.data?.error || "Failed to load comments");
            } finally {
                setLoading(false);
            }
        };
        getMyComments();
    }, []);

    const deleteComment = async (articleId, commentIndex) => {
        if (!window.confirm("Delete this comment?")) return;
        try {
            await axios.delete(
                `${import.meta.env.VITE_URL}/user-api/comment`,
                {
                    data: { articleId, commentIndex },
                    withCredentials: true
                }
            );
            // Remove from state
            setMyComments(prev => prev.filter((_, i) =>
                !(prev[i].articleId === articleId && prev[i].commentIndex === commentIndex)
            ));
        } catch(err) {
            console.log("delete error", err);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            dateStyle: "medium",
            timeStyle: "short",
        });
    };

    const onLogout = async () => {
        await logout();
        navigate("/login");
    };

    if (loading) return <p className={loadingClass}>Loading...</p>;

    return (
        <div className="max-w-5xl mx-auto px-6 py-10">
            {error && <p className={errorClass}>{error}</p>}

            {/* Profile Header */}
            <div className="bg-white border border-[#e8e8ed] rounded-3xl p-6 mb-8 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {currentUser?.profileImageUrl ? (
                        <img
                            src={currentUser.profileImageUrl}
                            className="w-16 h-16 rounded-full object-cover border"
                            alt="profile"
                        />
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-[#0066cc]/10 text-[#0066cc] flex items-center justify-center text-xl font-semibold">
                            {currentUser?.firstName?.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div>
                        <p className="text-sm text-[#6e6e73]">Welcome back</p>
                        <h2 className="text-xl font-semibold text-[#1d1d1f]">
                            {currentUser?.firstName} {currentUser?.lastName}
                        </h2>
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

            {/* My Comments Section */}
            <div>
                <h3 className="text-lg font-semibold text-[#1d1d1f] mb-4">
                    My Comments ({myComments.length})
                </h3>

                {myComments.length === 0 ? (
                    <p className="text-[#a1a1a6] text-sm text-center py-10">
                        You haven't commented on any articles yet.
                    </p>
                ) : (
                    <div className="flex flex-col gap-4">
                        {myComments.map((item, i) => (
                            <div
                                key={i}
                                className="bg-[#f5f5f7] rounded-2xl p-5 hover:bg-[#ebebf0] transition"
                            >
                                {/* Article title */}
                                <p className="text-xs font-semibold text-[#0066cc] uppercase tracking-widest mb-2">
                                    {item.articleTitle}
                                </p>

                                {/* Comment text */}
                                <p className="text-[#1d1d1f] text-sm leading-relaxed mb-3">
                                    {item.comment}
                                </p>

                                {/* Footer */}
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-[#a1a1a6]">
                                        {formatDate(item.createdAt)}
                                    </p>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => navigate(`/article/${item.articleId}`)}
                                            className={ghostBtn}
                                        >
                                            View Article →
                                        </button>
                                        <button
                                            onClick={() => deleteComment(item.articleId, item.commentIndex)}
                                            className="text-xs text-[#ff3b30] hover:text-[#d62c23] transition font-medium"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default UserProfile;

// import { useAuth } from "../store/authStore";
// import { useNavigate } from "react-router";
// import axios from "axios";
// import { useEffect, useState } from "react";

// import {
//   articleGrid,
//   articleCardClass,
//   articleTitle,
//   ghostBtn,
//   loadingClass,
//   errorClass,
//   timestampClass,
// } from "../styles/common.js";

// function UserProfile() {
//   const logout = useAuth((state) => state.logout);
//   const currentUser = useAuth((state) => state.currentUser);
//   const navigate = useNavigate();

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [articles, setArticles] = useState([]);

//   useEffect(() => {
//     const getArticles = async () => {
//       setLoading(true);
//       try {
//         //read articles of all authors
//         let res=await axios.get(`${import.meta.env.VITE_URL}/user-api/articles`, {withCredentials:true});
//         //update articles state
//         if(res.status===200){
//           setArticles((await res).data.payload)
//         }
//       } catch (err) {
//         setError(err.response?.data?.error || "Something went wrong");
//       } finally {
//         setLoading(false);
//       }
//     };

//     getArticles();
//   }, []);

//   // convert UTC → IST
//   const formatDateIST = (date) => {
//     return new Date(date).toLocaleString("en-IN", {
//       timeZone: "Asia/Kolkata",
//       dateStyle: "medium",
//       timeStyle: "short",
//     });
//   };

//   const onLogout = async () => {
//     await logout();

//     navigate("/login");
//   };

//   const navigateToArticleByID = (articleObj) => {
//     navigate(`/article/${articleObj._id}`, {
//       state: articleObj,
//     });
//   };

//   if (loading) {
//     return <p className={loadingClass}>Loading articles...</p>;
//   }

//   return (
//     <div className="max-w-5xl mx-auto px-6 py-10">
//       {/* ERROR */}
//       {error && <p className={errorClass}>{error}</p>}

//       {/* PROFILE HEADER */}
//       <div className="bg-white border border-[#e8e8ed] rounded-3xl p-6 mb-8 shadow-sm flex items-center justify-between">
//         {/* LEFT */}
//         <div className="flex items-center gap-4">
//           {/* Avatar */}
//           {currentUser?.profileImageUrl ? (
//             <img
//               src={currentUser.profileImageUrl}
//               className="w-16 h-16 rounded-full object-cover border"
//               alt="profile"
//             />
//           ) : (
//             <div className="w-16 h-16 rounded-full bg-[#0066cc]/10 text-[#0066cc] flex items-center justify-center text-xl font-semibold">
//               {currentUser?.firstName?.charAt(0).toUpperCase()}
//             </div>
//           )}

//           {/* Name */}
//           <div>
//             <p className="text-sm text-[#6e6e73]">Welcome back</p>
//             <h2 className="text-xl font-semibold text-[#1d1d1f]">{currentUser?.firstName}</h2>
//           </div>
//         </div>

//         {/* LOGOUT */}
//         <button
//           className="bg-[#ff3b30] text-white text-sm px-5 py-2 rounded-full hover:bg-[#d62c23] transition"
//           onClick={onLogout}
//         >
//           Logout
//         </button>
//       </div>

//       {/* ARTICLES SECTION */}
//       <div className="mt-4">
//         <h3 className="text-lg font-semibold text-[#1d1d1f] mb-4">Latest Articles</h3>

//         {/* EMPTY STATE */}
//         {articles.length === 0 ? (
//           <p className="text-[#a1a1a6] text-sm text-center py-10">No articles available yet</p>
//         ) : (
//           <div className={articleGrid}>
//             {articles.map((articleObj) => (
//               <div className={articleCardClass} key={articleObj._id}>
//                 <div className="flex flex-col h-full">
//                   {/* TOP */}
//                   <div>
//                     <p className={articleTitle}>{articleObj.title}</p>

//                     <p className="text-sm text-[#6e6e73] mt-1">{articleObj.content.slice(0, 80)}...</p>

//                     <p className={`${timestampClass} mt-2`}>{formatDateIST(articleObj.createdAt)}</p>
//                   </div>

//                   {/* ACTION */}
//                   <button className={`${ghostBtn} mt-auto pt-4`} onClick={() => navigateToArticleByID(articleObj)}>
//                     Read Article →
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default UserProfile