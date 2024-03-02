import { useEffect, useState } from "react";

export const useUniqueId = (name?: string) => {
    const [uniqueId, setUniqueId] = useState<string>('');

    useEffect(() => {
        // Define all possible characters
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let uniqueID = '';

        // Generate a random alphanumeric character and append to uniqueID until it's 4 or 8 characters long
        if (name) {
            uniqueID += name.toLowerCase().replace(/\s+/g, '-');;
            uniqueID += '-';
            for (let i = 0; i < 4; i++) {
                const randomIndex = Math.floor(Math.random() * characters.length);
                uniqueID += characters[randomIndex];
            }
        } else {
            for (let i = 0; i < 8; i++) {
                const randomIndex = Math.floor(Math.random() * characters.length);
                uniqueID += characters[randomIndex];
            }
        }
        setUniqueId(uniqueID);
    }, [name]);
    return uniqueId;
}