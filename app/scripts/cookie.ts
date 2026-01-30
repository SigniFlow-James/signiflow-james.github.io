// ========================================
// FILE: scripts/cookie.ts
// ========================================

export function setCookie(
    value: string,
) {
    var hours = 1,
        path = '/',
        secure = true,
        sameSite = 'Lax'

    const expires = new Date()
    expires.setTime(expires.getTime() + hours * 60 * 60 * 1000)

    document.cookie =
        `${encodeURIComponent("SigniflowProcoreAdminToken")}=${encodeURIComponent(value)}; ` +
        `expires=${expires.toUTCString()}; ` +
        `path=${path}; ` +
        `SameSite=${sameSite}; ` +
        (secure ? 'Secure;' : '')
}
export function getCookie(): string | null {
    const match = document.cookie
        .split('; ')
        .find(row => row.startsWith(`${encodeURIComponent("SigniflowProcoreAdminToken")}=`))

    return match
        ? decodeURIComponent(match.split('=')[1] ?? '')
        : null
}
export function clearCookie(){
    var path = '/',
        secure = true,
        sameSite = 'Lax'

    const expires = new Date()
    expires.setTime(expires.getTime() - 24 * 60 * 60 * 1000)
    document.cookie =
        `${encodeURIComponent("SigniflowProcoreAdminToken")}=${encodeURIComponent('')}; ` +
        `expires=${expires.toUTCString()}; ` +
        `path=${path}; ` +
        `SameSite=${sameSite}; ` +
        (secure ? 'Secure;' : '')
}

// ========================================
// FILE: scripts/cookie.ts
// ========================================