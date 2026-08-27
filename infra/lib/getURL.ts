import canUseDOM from './canUseDOM'

export const getServerURL = () => {
    return (
        import.meta.env.VITE_BASE_URL ||
        (import.meta.env.VITE_BASE_URL
            ? import.meta.env.VITE_BASE_URL
            : 'http://localhost:3000')
    )
}

export const getClientURL = () => {
    if (canUseDOM) {
        const protocol = window.location.protocol
        const domain = window.location.hostname
        const port = window.location.port

        return `${protocol}//${domain}${port ? `:${port}` : ''}`
    }

    if (import.meta.env.VITE_BASE_URL) {
        return import.meta.env.VITE_BASE_URL
    }

    return process.env.VITE_BASE_URL || ''
}