import { AssistantPrompt } from "./Chat";

type AssistantPromptsProps = {
    showAssistant: boolean;
    selectPrompt: (p: AssistantPrompt) => void
}

const assistantPrompts = [
    {
        id: 1, prompt: 'Tell me a joke about AI'
    },
/*     {
        id: 2, prompt: 'Answer with a British accent.'
    }, */
    {
        id: 3, prompt: 'Reply in the language of my choice.',
        instructions: 'LANGUAGE_CHANGE_INSTRUCTION'
    },
    {
        id: 4, prompt: 'Assign a name to the Assitant.',
        instructions: 'ASSIGN_NAME_INSTRUCTION'
    },
    {
        id: 5, prompt: 'Clear Conversation',
        instructions: 'CLEAR_THREAD_INSTRUCTION'
    },
    
];

const AssistantPrompts = ({showAssistant, selectPrompt}: AssistantPromptsProps) => {

    return (
        <div className={`flex flex-col suggestions absolute p-3 bottom-20 z-30 text-slate-900 ${showAssistant ? 'show' : ''}`}>
        {assistantPrompts.map(p => {
            return <div key={p.id} className='prompt relative inline-block'>
                <p className='cursor-pointer p-2 rounded-lg mb-3 inline-block' onClick={() => selectPrompt(p)}>{p.prompt}</p>
            </div>
        })
        }
    </div>
    )
}

export default AssistantPrompts