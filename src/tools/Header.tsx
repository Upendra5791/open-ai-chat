
const Header = () => {
    return (
        <>
            <div className="flex flex-col relative">
                <header className="flex justify-between items-center text-white p-4 relative sticky top-0 z-40 w-full backdrop-blur flex-none transition-colors duration-500 lg:z-50 border-b border-slate-900/10 dark:border-slate-50/[0.06] bg-slate-200 supports-backdrop-blur:bg-slate-100/85 dark:bg-slate-900/75">
                    <div className="text-xl font-bold text-slate-900 dark:text-emerald-400">Tools</div>
                </header>
            </div>
        </>
    )
}

export default Header;