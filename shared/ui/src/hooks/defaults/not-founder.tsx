import { Link, useRouter } from "@tanstack/react-router"
import { Button, buttonVariants } from "../../components/button"
import type { PropsWithChildren } from "react"
import { cn } from "../../lib/utils"

type NotFoundProps = PropsWithChildren

export function NotFound({ children }: NotFoundProps) {
    const router = useRouter()

    return (
        <div className="flex min-h-[80svh] w-full flex-col items-center justify-center text-center">
            <section className="mx-auto flex w-full max-w-sm flex-col items-center justify-center gap-4">
                {children ?? (
                    <div className="flex flex-col items-center gap-2">
                        <span className="font-mono text-xs font-semibold tracking-widest text-destructive uppercase">
                            Error 404
                        </span>
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">
                            Page Not Found
                        </h2>
                        <p className="max-w-70 text-sm text-muted-foreground">
                            The page you are looking for might have been moved, renamed, or deleted.
                        </p>
                    </div>
                )}

                <div className="mt-2 flex items-center gap-2">
                    <Button onClick={() => router.history.back()} variant="secondary" size="sm">
                        Go back
                    </Button>
                    <Link to="/" className={cn(buttonVariants({ size: "sm" }))}>
                        Start Over
                    </Link>
                </div>
            </section>
        </div>
    )
}
