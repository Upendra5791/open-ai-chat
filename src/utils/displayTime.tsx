const getDisplayTime = (inputDate: string) => {
    if (!inputDate) return '';
    const today = new Date();
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);
    const date = new Date(inputDate);
    if (date.getTime() > today.getTime()) {
        let hour = date.getHours();
        const min = date.getMinutes();
        const meridiam = hour < 12 ? 'am' : 'pm';
        hour = hour % 12 || 12;
        return `${hour}:${String(min).padStart(2, '0')} ${meridiam} `
    } else {
        return `${date.getDate()}/${String(date.getMonth()+1).padStart(2, '0')}/${String(date.getFullYear()).padStart(2, '0')} `
    }
}

export default getDisplayTime;