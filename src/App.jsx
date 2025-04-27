// App.jsx or AppRoutes.jsx
import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import AddNovel from "./pages/AddNovel";
import AddChapter from "./pages/AddChapter";
import EditNovel from "./pages/EditNovel";
import EditChapter from "./pages/EditChapter";
import NovelDetail from "./pages/NovelDetail";
import ChapterDetail from "./pages/ChapterDetail";
import MyNovels from "./pages/MyNovels";
import Library from "./pages/Library";
import SearchResults from "./pages/SearchResults";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import { useAuth } from "./context/AuthContext";

const App = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Layout>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-novels"
          element={
            <ProtectedRoute>
              <MyNovels />
            </ProtectedRoute>
          }
        />
        <Route
          path="/library"
          element={
            <ProtectedRoute>
              <Library />
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <SearchResults />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-novel"
          element={
            <ProtectedRoute>
              <AddNovel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/novels/:novelId"
          element={
            <ProtectedRoute>
              <NovelDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/novels/:novelId/edit"
          element={
            <ProtectedRoute>
              <EditNovel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/novels/:novelId/add-chapter"
          element={
            <ProtectedRoute>
              <AddChapter />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chapters/:chapterId"
          element={
            <ProtectedRoute>
              <ChapterDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/novels/:novelId/edit-chapter/:chapterId"
          element={
            <ProtectedRoute>
              <EditChapter />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chapters/:chapterId/edit"
          element={
            <ProtectedRoute>
              <EditChapter />
            </ProtectedRoute>
          }
        />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          path="/signup"
          element={isAuthenticated ? <Navigate to="/" replace /> : <Signup />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

export default App;
