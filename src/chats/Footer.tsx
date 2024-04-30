
import { IoSettings } from "react-icons/io5";
import { BsChatSquareTextFill } from "react-icons/bs";
import { MdOutlineAssistant } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";

const btnClasses = 'cursor-pointer h-10 w-14 grid place-items-center rounded';
const Footer = () => {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    
    const getClasses = (btn: string) => {
        if ((btn === 'chats' && pathname.includes('/chats'))
            || (btn === 'settings' && pathname.includes('/settings'))
            || (btn === 'tools' && pathname.includes('/tools'))) {
                return btnClasses + ' dark:text-emerald-600'
        } else {
            return btnClasses + ' dark:text-white';
        }
    }
    return (
        <div className="pb-4 flex justify-evenly p-2 relative sticky top-0 z-40 w-full backdrop-blur transition-colors duration-500 lg:z-50 border-t border-slate-900/10 dark:border-slate-50/[0.06] bg-slate-100/85 dark:bg-slate-900/75">
            <div onClick={() => navigate('/tools')}
                className={getClasses('tools') + ' text-2xl'}>
                <div><MdOutlineAssistant /></div>
                <div className="text-xs">AI Tools</div>
            </div>
            <div onClick={() => navigate('/chats')}
                className={getClasses('chats') + ' text-xl'}>
                <div> <BsChatSquareTextFill /></div>
                <div className="text-xs">Chats</div>
            </div>
            <div onClick={() => navigate('/settings')}
                className={getClasses('settings') + ' text-2xl'}>
                <div> <IoSettings /></div>
                <div className="text-xs">Settings</div>

            </div>
        </div>
    )
}

export default Footer;