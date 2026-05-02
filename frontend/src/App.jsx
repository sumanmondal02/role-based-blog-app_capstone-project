import { createBrowserRouter,RouterProvider} from 'react-router'
import RootLayoutComp from './components/RootLayoutComp'
import HomeComp from './components/HomeComp'
import RegisterComp from './components/RegisterComp'
import LoginComp from './components/LoginComp'
import UserProfile from './components/UserProfile'
import AuthorProfile from './components/AuthorProfile'
import AuthorArticles from './components/AuthorArticles'
import AdminProfile from './components/AdminProfile'
import WriteArticle from './components/WriteArticle'
import EditArticle from './components/EditArticle'
import ArticleByID from "./components/ArticleByID";
// import UsersList from './components/UsersList'
import { Toaster } from "react-hot-toast";
import Unauthorized from "./components/Unauthorized";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {

  const routerObj= createBrowserRouter([
    {
      path:"/",
      element:<RootLayoutComp />,
      children:[
        {
          path:"",
          element:<HomeComp />
        },
        {path:"register",
          element:<RegisterComp />
        },
        {path:"login",
          element:<LoginComp />
        },
        {
          path:"user-profile",
          element:(
            <ProtectedRoute allowedRoles={["user"]}>
              <UserProfile />
            </ProtectedRoute>
          ),
        },
        {
          path:"author-profile",
          element:(
            <ProtectedRoute allowedRoles={["author"]}>
              <AuthorProfile />
            </ProtectedRoute>
          ),

          children: [
            {
              index: true,
              element: <AuthorArticles />,
            },
            {
              path: "articles",
              element: <AuthorArticles />,
            },
            {
              path: "write-article",
              element: <WriteArticle />,
            },
          ],
        },
        {
          path: "article/:id",
          element: <ArticleByID />,
        },
        {
          path: "edit-article",
          element: <EditArticle />,
        },
        {
          path:"admin-profile",
          element:(
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminProfile />
          </ProtectedRoute>
          ),
        },
        {
          path: "unauthorized",
          element: <Unauthorized />,
        },
      ],
    },
  ]);

  return (
    <div>
      <Toaster position="top-center" reverseOrder={false} />
      <RouterProvider router={routerObj} />
    </div>
  );
}

//   return (
//     <RouterProvider>
//       <RouterProvider router={routerObj} />
//     </RouterProvider>

export default App