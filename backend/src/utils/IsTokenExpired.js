function IsTokenExpired(createAt, expires, bufferSeconds = 60) {
    const formatedCreateAt = new Date(createAt);
    const formatedExpires = parseInt(expires) * 1000;
    const bufferMs = bufferSeconds * 1000;

    const expiresAt = new Date(formatedCreateAt.getTime() + formatedExpires);
    const safeExpiresAt = new Date(expiresAt.getTime() - bufferMs);
    const now = new Date();

    const delay = safeExpiresAt.getTime() - now.getTime();

    return {
        isExpired: now >= safeExpiresAt,
        delay: delay > 0 ? delay : 0
    }
}

export default IsTokenExpired;