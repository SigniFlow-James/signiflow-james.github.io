// ========================================
// FILE: scripts/cookies.ts
// ========================================

export function setAuthCookie(
    value: string | null,
) {
    if (!value) return

    var hours = 1, path = '/', secure = true, sameSite = 'Lax'
    const expires = new Date()
    expires.setTime(expires.getTime() + hours * 60 * 60 * 1000)

    document.cookie =
        `${encodeURIComponent('SigniflowProcoreAdminToken')}=${encodeURIComponent(value)}; ` +
        `expires=${expires.toUTCString()}; ` +
        `path=${path}; ` +
        `SameSite=${sameSite}; ` +
        (secure ? 'Secure;' : '')
}

export function getAuthCookie(): string | null {
    const match = document.cookie
        .split('; ')
        .find(row => row.startsWith(`${encodeURIComponent('SigniflowProcoreAdminToken')}=`))

    return match
        ? decodeURIComponent(match.split('=')[1] ?? '')
        : null
}

// ========================================
// FILE: scripts/cookies.ts
// ========================================