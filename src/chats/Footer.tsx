
import { IoSettings } from "react-icons/io5";
import { BsChatSquareTextFill } from "react-icons/bs";
import { useLocation, useNavigate } from "react-router-dom";

const btnClasses = 'cursor-pointer h-10 w-14 text-xl text-slate-900 dark:text-white grid place-items-center rounded';
const Footer = () => {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const getClasses = (btn: string) => {
        if (btn === 'chats') {
            return pathname.includes('/chats') ? btnClasses + ' dark:text-emerald-600' : btnClasses;
        } else if (btn === 'settings') {
            return pathname.includes('/settings') ? btnClasses + ' dark:text-emerald-600' : btnClasses;
        }
        console.log(pathname);
        return btnClasses;
    }
    return (
        <div className="flex justify-evenly p-2 relative sticky top-0 z-40 w-full backdrop-blur transition-colors duration-500 lg:z-50 border-t border-slate-900/10 dark:border-slate-50/[0.06] bg-slate-100/85 dark:bg-slate-900/75">
            <div onClick={() => navigate('/chats')}
                className={getClasses('chats')}>
                <BsChatSquareTextFill />
            </div>
            <div onClick={() => navigate('/settings')}
                className={getClasses('settings')}>
                <IoSettings />
            </div>
        </div>
    )
}

export default Footer;