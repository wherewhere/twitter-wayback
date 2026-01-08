export function popString(array: string[]) {
    while (array.length) {
        const str = array.pop();
        if (str) {
            return str;
        }
    }
}