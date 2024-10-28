function rtrim(str, charToRemove) {
    while (str.endsWith(charToRemove)) {
        str = str.slice(0, -charToRemove.length);
    }
    return str;
}