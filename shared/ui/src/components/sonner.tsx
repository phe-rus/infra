import { GooeyToaster as GooeyToasterPrimitive, gooeyToast, type GooeyToasterProps } from 'goey-toast'

export function ToasterProvider(props: GooeyToasterProps) {
    return <GooeyToasterPrimitive position='bottom-right' {...props} richColors />
}
export const t = gooeyToast