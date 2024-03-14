import { uid } from 'uid/secure';

export const getUniqueID = (length = 16): string => {
    return uid(length);
}