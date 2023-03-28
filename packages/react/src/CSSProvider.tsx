import { Config, MasterCSS } from '@master/css'
import { ReactElement, useEffect, useLayoutEffect, useState, useMemo, Context, createContext, useContext } from 'react'

const { instances } = MasterCSS
export const CSSContext: Context<MasterCSS> = createContext<MasterCSS>(null)

export function useCSS() {
    return useContext(CSSContext)
}

export const CSSProvider = ({
    children,
    config,
    root = typeof document !== 'undefined' ? document : null
}: {
    children: ReactElement,
    config?: Config,
    root?: Document | ShadowRoot | null
}) => {
    const [css, setCSS] = useState<MasterCSS>()
    const existingCSS = instances.find((eachCSS) => eachCSS.root === root)
    if (existingCSS) {
        setCSS(existingCSS)
    } else {
        setCSS(new MasterCSS({ ...config, observe: false }))
    }

    (typeof window !== 'undefined' ? useLayoutEffect : useEffect)(() => {
        if (!css.style) css.observe(root)
        return () => {
            css.destroy()
        }
    }, [css, root])

    return <CSSContext.Provider value={css}>{children}</CSSContext.Provider>
}