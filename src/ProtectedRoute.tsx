import { useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";
import { AppState } from "./store/store";
import { useEffect } from "react";


const ProtectedRoute = () => {
    const navigate = useNavigate();
    const user = useSelector((state: AppState) => state.user);

    useEffect(() => {
        if (!user || !!user && !Object.keys(user).length) {
            navigate("/");
        }
    }, [user])

    return (<Outlet />);

}
export default ProtectedRoute;