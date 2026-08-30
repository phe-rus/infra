import { cn } from "@infra/ui/lib/utils"
import { Link } from "@tanstack/react-router"
import { config } from "./config"

export const Footers = () => {
    return (
        <footer className='bg-muted/35'>
            <section className={cn(
                'container flex flex-col gap-5 w-full md:max-w-4xl',
                'py-30'
            )}>
                <div className='flex items-center'>
                    <h1>Pherus</h1>
                </div>
                <span className='h-px w-full bg-primary/5' />
                <div className='relative columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-5'>
                    {config.map((group, inx) => (
                        <div key={inx} className="flex flex-col break-inside-avoid gap-2 mb-5">
                            <h3>{group.label}</h3>
                            <div className="flex flex-col">
                                {group.items.map((item, index) =>
                                    item.to ? (
                                        <Link key={index} to={item.to}>
                                            {item.label}
                                        </Link>
                                    ) : (
                                        <span
                                            key={index}
                                            className="text-muted-foreground"
                                        >
                                            {item.label}
                                        </span>
                                    )
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </footer>
    )
}