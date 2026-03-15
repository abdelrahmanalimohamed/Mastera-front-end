import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DataTablePage from "./pages/DataTablePage";
import SignIn from "./pages/SignIn";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/resetpassword" element={<ResetPassword />} />

        <Route
          path="/datatable"
          element={
            <PrivateRoute>
              <DataTablePage />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
