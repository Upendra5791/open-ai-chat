import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setTheme } from "./store/ThemeSlice";


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
    }, [dispatch]);

    return null

}

export default Theme;