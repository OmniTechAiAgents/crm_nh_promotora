function IsTokenExpired(updatedAt, expires, bufferSeconds = 60) {
    const updatedTime = new Date(updatedAt).getTime();

    if (isNaN(updatedTime)) {
        throw new Error("updatedAt inválido");
    }

    const expiresMs = Number(expires) * 1000;
    const bufferMs = bufferSeconds * 1000;

    const expiresAt = updatedTime + expiresMs;
    const safeExpiresAt = expiresAt - bufferMs;

    const now = Date.now();

    const delay = safeExpiresAt - now;

    const isExpired = delay <= 0;

    return {
        isExpired,
        delay: Math.max(delay, 0)
    };
}

export default IsTokenExpired;