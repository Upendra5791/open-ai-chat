const languages = [
    'English',
    'Nepali',
    'Hindi',
    'Tamil'
]

const AssistantWidget = ({
    assistantClass,
    language,
    translate,
    setTranslate,
    expandAssistant,
    setLanguage
}: {
    assistantClass: string,
    translate: boolean,
    language: string,
    setTranslate: (val: boolean) => void,
    expandAssistant: () => void,
    setLanguage: (val: string) => void,
}) => {

    const asistantStyles = assistantClass + ' absolute bg-slate-100 dark:bg-slate-900';

    return (
        <div className={asistantStyles}
            onClick={expandAssistant}>
            <input id="translate" type='checkbox' checked={translate} value='translate'
                onChange={() => setTranslate(!translate)} />
            <label htmlFor='translate'>
                <span className='pl-2'>Translate your message to &nbsp;
                    <select className='languages text-center bg-slate-100 dark:bg-slate-900 border-bottom border-b-[2px] border-slate-900 dark:border-slate-100'
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}>
                        {
                            languages.map(l => {
                                return <option key={l} value={l}>{l}</option>
                            })
                        }
                    </select>
                    &nbsp; before sending</span>
            </label>
        </div>
    )

}

export default AssistantWidget;