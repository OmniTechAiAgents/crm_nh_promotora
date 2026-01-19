function ParseNascNV(nasc) {
    const str = nasc.toString();
    const year = str.substring(0, 4);
    const month = str.substring(4, 6);
    const day = str.substring(6, 8);

    return `${year}-${month}-${day}`;
}

export default ParseNascNV;