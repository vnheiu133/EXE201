export async function register(userData: any) {
    const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    })

    if (!res.ok) {
        throw new Error(await getErrorMessage(res, 'Đăng ký thất bại'))
    }
    return res.json()
}

export async function login(email: string, password: string) {
    const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
        throw new Error(await getErrorMessage(res, 'Email hoặc mật khẩu không chính xác'))
    }
    return res.json()
}

export async function googleLogin(idToken: string) {
    const res = await fetch('/api/auth/google-login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
    })

    if (!res.ok) {
        throw new Error(await getErrorMessage(res, 'Đăng nhập Google thất bại'))
    }
    return res.json()
}

export async function googleCodeLogin(code: string, redirectUri: string) {
    const res = await fetch('/api/auth/google-code-login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, redirectUri }),
    })

    if (!res.ok) {
        throw new Error(await getErrorMessage(res, 'Đăng nhập Google thất bại'))
    }
    return res.json()
}

async function getErrorMessage(res: Response, fallback: string) {
    try {
        const errorData = await res.json()
        return errorData.message || errorData.Message || fallback
    } catch {
        return fallback
    }
}
