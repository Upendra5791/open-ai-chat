import { useEffect, useState } from "react";

const languages = [
    'English',
    'French',
    'Nepali',
    'Hindi',
    'Bengali',
    'Tamil'
]

const AssistantWidget = ({
    showAssistant,
    incomingLanguage,
    outgoingLanguage,
    translateIncoming,
    translateOutgoing,
    setTranslateIncoming,
    setTranslateOutgoing,
    expandAssistant,
    setIncomingLanguage,
    setOutgoingLanguage
}: {
    showAssistant: boolean,
    translateIncoming: boolean,
    translateOutgoing: boolean,
    incomingLanguage: string,
    outgoingLanguage: string,
    setTranslateIncoming: (val: boolean) => void,
    setTranslateOutgoing: (val: boolean) => void,
    expandAssistant: () => void,
    setIncomingLanguage: (val: string) => void,
    setOutgoingLanguage: (val: string) => void,
}) => {

    const [assistantClass, setAssistantClass] = useState<string>('chat-assistant');
    const asistantStyles = assistantClass + ' absolute bg-slate-100 dark:bg-slate-900 z-30';

    useEffect(() => {
        if (showAssistant) {
            setAssistantClass('chat-assistant show pop');
        } else {
            setAssistantClass('chat-assistant pop');
        }
    }, [showAssistant])

    return (
        <div className={asistantStyles}
            onClick={expandAssistant}>
            <div>
                <input id="translateOut" type='checkbox' checked={translateOutgoing} value='translate'
                    onChange={() => setTranslateOutgoing(!translateOutgoing)} />
                <label htmlFor='translateOut'>
                    <span className='pl-2'>Translate your message to &nbsp;
                        <select className='languages text-center bg-slate-100 dark:bg-slate-900 border-bottom border-b-[2px] border-slate-900 dark:border-slate-100'
                            value={outgoingLanguage}
                            onChange={(e) => setOutgoingLanguage(e.target.value)}>
                            {
                                languages.map(l => {
                                    return <option key={l + 'outgoing'} value={l}>{l}</option>
                                })
                            }
                        </select>
                        &nbsp; before sending</span>
                </label>
            </div>
            {/* <div>
                <input id="translateIn" type='checkbox' checked={translateIncoming} value='translate'
                    onChange={() => setTranslateIncoming(!translateIncoming)} />
                <label htmlFor='translateIn'>
                    <span className='pl-2'>Translate incoming message to &nbsp;
                        <select className='languages text-center bg-slate-100 dark:bg-slate-900 border-bottom border-b-[2px] border-slate-900 dark:border-slate-100'
                            value={incomingLanguage}
                            onChange={(e) => setIncomingLanguage(e.target.value)}>
                            {
                                languages.map(l => {
                                    return <option key={l+'incoming'} value={l}>{l}</option>
                                })
                            }
                        </select>
                        &nbsp; before sending</span>
                </label>
            </div> */}
        </div>
    )

}

export default AssistantWidget;