'use client';
import { createContext, useContext, useState } from "react"

const PopupContext = createContext<[(show: boolean) => void, (popup: React.ReactNode) => void]>([() => {}, () => {}]);

export default function usePopup() {
    const [setIsShow, setPopup] = useContext(PopupContext);
    
    function show(popup: React.ReactNode) {
        setIsShow(true);
        setPopup(popup);
    }
    function hide() {
        setIsShow(false);
    }

    return ({
        show,
        hide
    });
}

export function PopupProvider({
    children
}: { children: React.ReactNode}) {
    const [isShow, setIsShow] = useState(false);
    const [popup, setPopup] = useState<React.ReactNode>();

    return (
        <PopupContext.Provider value={[setIsShow, setPopup]}>
            {children}
            {isShow && 
                <section 
                    className="fixed inset-0 bg-black bg-opacity-80 z-50"
                    onClick={() => setIsShow(false)}
                >
                <div 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    onClick={e => e.stopPropagation()}
                >
                    {popup}
                </div>
                </section>
            }
        </PopupContext.Provider>
    )
}