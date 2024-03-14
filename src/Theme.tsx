import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTheme, setTheme } from "./store/ThemeSlice";
import { AppState } from "./store/store";


const Theme = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        if (!('theme' in localStorage) || localStorage.theme === 'dark') {
            document.documentElement.classList.add('dark');
            dispatch(setTheme('dark'));
        } else {
            document.documentElement.classList.remove('dark');
            dispatch(setTheme('light'));
        }
    }, []);

    return null

}

export default Theme;