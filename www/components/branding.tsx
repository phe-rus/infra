import { Link } from "@tanstack/react-router"

export const Branding = () => {
    return (
        <Link
            to='/'
            className='flex items-center gap-2 border w-fit'
        >
            <picture>
                <img
                    src="/favicon.svg"
                    alt="Pherus"
                    className="size-6.5 dark:hidden"
                    data-not-typeset
                />
                <img
                    src="/favicon_light.png"
                    alt="Pherus"
                    className="size-6.5 hidden dark:block"
                    data-not-typeset
                />
            </picture>
            <h3 className="mr-2 font-normal">Pherus</h3>
        </Link>
    )
}