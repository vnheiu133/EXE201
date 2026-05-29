export async function register(userData: any) {
    const res = await fetch('http://localhost:5278/api/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    })

    if (!res.ok) {
        throw new Error(await getErrorMessage(res, 'Registration failed'))
    }
    return res.json()
}

export async function login(email: string, password: string) {
    const res = await fetch('http://localhost:5278/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
        throw new Error(await getErrorMessage(res, 'Invalid email or password'))
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
