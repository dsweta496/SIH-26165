import {
    BrowserRouter,
    Routes,
    Route,
} from "react-router-dom";

import Dashboard from "./pages/public/Dashboard";
import Login from "./pages/public/Login";
import Admin from "./pages/admin/Admin";
import AdminReview from "./pages/admin/AdminReview";
import AdminActiveCases from "./pages/admin/AdminActiveCases";
import AdminPendingSolutions from "./pages/admin/AdminPendingSolutions";
import AdminPastCaseHistory from "./pages/admin/AdminPastCaseHistory";
import TeamProposal from "./pages/public/TeamProposal";
import TeamSignup from "./pages/public/TeamSignup";
import CreateProblemReport from "./pages/public/CreateProblemReport";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={<Dashboard />}
                />
                <Route path="/login" element={<Login />} />
                <Route
                    path="/admin"
                    element={<Admin />}
                />
                <Route
                    path="/admin/review"
                    element={<AdminReview />}
                />
                <Route
                    path="/admin/cases"
                    element={<AdminActiveCases />}
                />
                <Route
                    path="/admin/solutions"
                    element={<AdminPendingSolutions />}
                />
                <Route
                    path="/admin/history"
                    element={<AdminPastCaseHistory />}
                />
                <Route
                    path="/team-proposal/:reportId"
                    element={<TeamProposal />}
                />
                <Route
                    path="/team/signup"
                    element={<TeamSignup />}
                />
                <Route
                    path="/report"
                    element={<CreateProblemReport />}
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;