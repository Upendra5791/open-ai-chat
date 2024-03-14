

const Typing = ({selfType = false}) => {

    return (
        <li key='message-loading' className='grid justify-items-stretch mb-2'>
            <div className={`justify-start reciever flex w-full ${selfType ? 'justify-self-end' : 'justify-self-start'}`}>
                <div className="chat-message rounded-lg p-2 max-w-[85%] text-sm relative">
                    <div className='relative text-transparent z-10'>
                        . .eee.
                        <span className='ball bg-slate-100 '></span>
                        <span className='ball bg-slate-100'></span>
                        <span className='ball bg-slate-100'></span>
                    </div>

                </div>
            </div>
        </li>
    );
}

export default Typing;