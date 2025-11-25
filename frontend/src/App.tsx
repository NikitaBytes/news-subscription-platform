// App.tsx - главный компонент с роутингом

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Navbar } from "./components/common/Navbar";
import { ProtectedRoute } from "./components/common/ProtectedRoute";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { NewsPage } from "./pages/NewsPage";
import { NewsDetailPage } from "./pages/NewsDetailPage";
import { SubscriptionsPage } from "./pages/SubscriptionsPage";
import { AdminPage } from "./pages/AdminPage";
import { RegisterForm } from "./components/auth/RegisterForm";
import { NewsEditor } from "./components/news/NewsEditor";
import { ROLES } from "./utils/constants";

function App() {
	return (
		<AuthProvider>
			<BrowserRouter>
				<Navbar />
				<Routes>
					<Route path="/" element={<HomePage />} />
					<Route path="/login" element={<LoginPage />} />
					<Route path="/register" element={<RegisterForm />} />
					<Route path="/news" element={<NewsPage />} />
					<Route path="/news/:id" element={<NewsDetailPage />} />
					<Route
						path="/news/create"
						element={
							<ProtectedRoute requiredRole={ROLES.EDITOR}>
								<NewsEditor />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/news/edit/:id"
						element={
							<ProtectedRoute requiredRole={ROLES.EDITOR}>
								<NewsEditor />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/subscriptions"
						element={
							<ProtectedRoute requiredRole={ROLES.SUBSCRIBER}>
								<SubscriptionsPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/admin"
						element={
							<ProtectedRoute requiredRole={ROLES.ADMIN}>
								<AdminPage />
							</ProtectedRoute>
						}
					/>
				</Routes>
			</BrowserRouter>
		</AuthProvider>
	);
}

export default App;
