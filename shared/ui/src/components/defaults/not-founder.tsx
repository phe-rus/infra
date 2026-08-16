import { Link, useRouter } from '@tanstack/react-router'
import { Button, buttonVariants } from '../ui/button'
import type { PropsWithChildren } from 'react'
import { cn } from '../../lib/utils'

type NotFoundProps = PropsWithChildren

export function NotFound({ children }: NotFoundProps) {
    const router = useRouter()

    return (
        <div className='flex flex-col items-center justify-center min-h-[80svh] w-full text-center'>
            <section className='flex flex-col items-center justify-center w-full max-w-sm gap-4 mx-auto'>
                {children ?? (
                    <div className='flex flex-col items-center gap-2'>
                        <span className='font-mono text-xs font-semibold tracking-widest uppercase text-destructive'>
                            Error 404
                        </span>
                        <h2 className='text-2xl font-bold tracking-tight text-foreground'>
                            Page Not Found
                        </h2>
                        <p className='text-sm text-muted-foreground max-w-70'>
                            The page you are looking for might have been moved, renamed, or
                            deleted.
                        </p>
                    </div>
                )}

                <div className='flex items-center gap-2 mt-2'>
                    <Button
                        onClick={() => router.history.back()}
                        variant='secondary'
                        size='sm'
                    >
                        Go back
                    </Button>
                    <Link
                        to='/'
                        className={cn(buttonVariants({ size: 'sm' }))}
                    >
                        Start Over
                    </Link>
                </div>
            </section>
        </div>
    )
}