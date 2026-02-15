import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DataTablePage from "./pages/DataTablePage";
import SignIn from "./pages/SignIn";
import Register from "./pages/Register";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/register" element={<Register />} />

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
