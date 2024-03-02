import { useSelector } from "react-redux";
import { AppState } from "../store/store";


const Header = () => {

    const userName = useSelector((state: AppState) => state.user.name);
    return (
        <div className="flex flex-col">
            <header className="flex justify-between items-center bg-gray-800 text-white p-4">
                <div className="text-xl font-bold">Chats</div>
                {userName && <div className="text-l font-bold">{userName}</div>}
                <button className="text-xl text-white">
                    {/* You can replace this with your '+' icon */}
                    +
                </button>
            </header>
            <div className="bg-gray-200 p-4">
                <input
                    type="text"
                    placeholder="Search chats"
                    className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring focus:border-blue-300 text-black"
                />
            </div>
        </div>
    )
}

export default Header;