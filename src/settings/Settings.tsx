import Footer from "../chats/Footer";
import { MdDarkMode } from "react-icons/md";
import { MdLightMode } from "react-icons/md";
import { getTheme, setTheme } from "../store/ThemeSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "../store/store";

const Settings = () => {
    const dispatch = useDispatch();

    const theme = useSelector((state: AppState) => getTheme(state));
    const handleClick = (mode: 'dark' | 'light') => {
        dispatch(setTheme(mode));
        if (mode === 'dark') {
            document.documentElement.classList.add('dark')
            document.documentElement.classList.remove('light')
        } else {
            document.documentElement.classList.remove('dark')
            document.documentElement.classList.add('light')
        }
        localStorage.setItem('theme', mode);
    }
    return (
        <div className="flex flex-col h-screen">
            <div className="flex flex-col relative">
                <header className="flex justify-between items-center text-white p-4 relative sticky top-0 z-40 w-full backdrop-blur flex-none transition-colors duration-500 lg:z-50 border-b border-slate-900/10 dark:border-slate-50/[0.06] bg-slate-100/85 supports-backdrop-blur:bg-slate-100/85 dark:bg-slate-900/75">
                    <div className="text-xl font-bold text-slate-900 dark:text-white">Settings</div>
                    {theme === 'light' ? <div onClick={() => handleClick('dark')} className="text-2xl cursor-pointer text-slate-900">
                        <MdDarkMode />
                    </div> :
                        <div onClick={() => handleClick('light')} className="text-2xl cursor-pointer">
                            <MdLightMode />
                        </div>}
                </header>
            </div>
            <div className="flex-1 overflow-y-auto">
                {/* <p> Hi This is settings page</p> */}
            </div>
            <Footer />
        </div>

    )
}

export default Settings;