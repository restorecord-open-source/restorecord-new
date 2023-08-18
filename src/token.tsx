import { createContext, useContext, useEffect, useState } from "react";

const Context = createContext<[string | null, (newToken: string | null) => void]>([null, () => {}]);

export const TokenProvider = ({children}: any) => {
    const [token, setToken]: any = useState<any>(null)

    useEffect(() => {
        if (process.browser) {
            try {
                const savedToken = localStorage.getItem('token')
                if (!token && savedToken) {
                    setToken(savedToken)
                }
            } catch (error) {
                console.error(error)
            }
        }
    }, [])

    function wrappedSetToken(newToken: any) {
        if (process.browser) {
            if (newToken) {
                localStorage.setItem('token', newToken)
            } else {
                localStorage.removeItem('token')
            }
        }
        setToken(newToken)
    }

    return (
        <Context.Provider value={[token, wrappedSetToken] as any}>
            {children}
        </Context.Provider>
    )
}

export function useToken() {
    return useContext(Context)
}