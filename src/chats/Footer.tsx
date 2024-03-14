
import { IoSettings } from "react-icons/io5";
import { BsChatSquareTextFill } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
const Footer = () => {

    const navigate = useNavigate();

    return (
        <div className="flex justify-evenly p-2 relative sticky top-0 z-40 w-full backdrop-blur transition-colors duration-500 lg:z-50 border-t border-slate-900/10 dark:border-slate-50/[0.06] bg-slate-100/85 dark:bg-slate-900/75">
            <div onClick={() => navigate('/chats')}
                className="cursor-pointer h-10 w-10 text-xl text-slate-900 dark:text-white grid place-items-center">
                <BsChatSquareTextFill />
            </div>
            <div onClick={() => navigate('/settings')}
                className="cursor-pointer h-10 w-10 text-2xl text-slate-900 dark:text-white grid place-items-center">
                <IoSettings />
            </div>
        </div>
    )
}

export default Footer;