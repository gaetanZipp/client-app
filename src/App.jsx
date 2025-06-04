import { Navigate, Route, Routes, useLocation, Outlet} from "react-router-dom";
import {Home, Login, Profile, Register, ResetPassword }  from './pages';
import { useSelector } from "react-redux";
import { Family } from "./pages";

function Layout() {
  const {user} = useSelector((state) => state.user);
  const location = useLocation();
  // console.log(user);

  return user?.token ? (
    <Outlet />
  ) : (
    <Navigate to="/" state={{ from: location }} replace />
  );
}

function App() {
  const { theme } = useSelector((state) => state.theme);

  return (
    <div data-theme = { theme } className="w-full min-h-[100vh]">
      <Routes>
        <Route element={<Layout />}>
          <Route path='/home' element={<Home />} />
          <Route path='/profile/:id?' element={<Profile />} />
        </Route>

        <Route path='/' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/reset-password' element={<ResetPassword />} />
        <Route path='/familyTree' element={<Family />} />
      </Routes>
    </div>
  );
}

export default App;
