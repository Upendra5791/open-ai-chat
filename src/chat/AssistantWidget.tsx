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

    return (
        <div className={assistantClass}
        onClick={expandAssistant}>
            <input id="translate" type='checkbox' checked={translate} value='translate'
                onChange={() => setTranslate(!translate)} />
            <label htmlFor='translate' className={translate ? '' : 'text-slate-400'}>
                <span className='pl-2'>Translate your message to &nbsp;
                    <select className='languages'
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