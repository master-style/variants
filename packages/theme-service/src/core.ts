import { extend } from '@techor/extend'
import defaultOptions, { Options, ThemeValue } from './options'

export class ThemeService {

    // 按照系統的主題切換，目前只支援 light dark
    private _darkMQL: MediaQueryList = typeof window !== 'undefined' ? matchMedia?.('(prefers-color-scheme:dark)') : undefined
    private _value: ThemeValue
    private _current: string

    constructor(
        public options?: Options,
        public host = typeof document !== 'undefined' ? document.documentElement : null
    ) {
        this.options = options ? extend(defaultOptions, options) : defaultOptions
        if (this.options.init) {
            this.init()
        }
    }

    init() {
        let value = this.options.default
        const storage = this.storage
        if (storage) {
            value = storage
        }
        this.value = value
    }

    get storage() {
        const { store } = this.options
        if (typeof localStorage !== 'undefined' && store) {
            return localStorage.getItem(store)
        }
    }

    get systemCurrent(): string {
        return this._darkMQL.matches ? 'dark' : 'light'
    }

    set value(value: ThemeValue) {
        this._value = value
        if (value === 'system') {
            this._darkMQL?.addEventListener?.('change', this._onThemeChange)
            this.current = this.systemCurrent
        } else {
            this._removeDarkMQLListener()
            this.current = value
        }
    }

    get value() {
        return this._value
    }

    set current(current: string) {
        const previous = this._current
        this._current = current
        if (this.host && previous !== current) {
            if (previous)
                this.host.classList.remove(previous)
            if (current && !this.host.classList.contains(current)) {
                this.host.classList.add(current)
                if ((this.host as any).style) {
                    (this.host as any).style.colorScheme =
                        (current === 'dark' || current === 'light') ? current : null
                }
            }
        }
    }

    get current() {
        return this._current
    }

    switch(value: ThemeValue, options: { store?: boolean, emit?: boolean } = { store: true, emit: true }) {
        if (value && value !== this.value) {
            this.value = value
            // 儲存 theme 到 localStorage
            if (typeof localStorage !== 'undefined' && this.storage !== value && this.options.store) {
                localStorage.setItem(this.options.store, value)
            }
            if (options.emit) {
                this.host.dispatchEvent(new CustomEvent('theme', { detail: this }))
            }
        }
    }

    private _removeDarkMQLListener() {
        this._darkMQL?.removeEventListener('change', this._onThemeChange)
    }

    private _onThemeChange = (mediaQueryList: MediaQueryListEvent) => {
        this.current = mediaQueryList.matches ? 'dark' : 'light'
    }

    destroy() {
        this._removeDarkMQLListener()
        if (this.host) {
            this.host.style.colorScheme = null
            this.host.classList.remove(this.current)
        }
        if (typeof localStorage !== 'undefined' && this.options.store) {
            localStorage.removeItem(this.options.store)
        }
    }
}

declare global {
    interface Window {
        ThemeService: typeof ThemeService
    }
}