'use client';
import Icon from "@/components/Icon";
import { Modal } from "@mui/material";
import { createContext, useContext, useState } from "react";

const LoadingContext = createContext<(prop: boolean) => void>(() => { });

export default function useLoadingAnimation():(prop: boolean) => void {
    return useContext(LoadingContext);
}

export const LoadingAnimationProvider = ({
    children
}: {
    children: React.ReactNode
}) => {
    const [isShowLoading, setIsShowLoading] = useState(false);
    
    const setLoading = (isShow: boolean) => {
        setIsShowLoading(isShow);
    }
    
    return (
        <LoadingContext.Provider value={setLoading}>
        {children}
        <Modal
            open={isShowLoading}
            children={<Progressing />}
        />
        </LoadingContext.Provider>
    )
}

function Progressing() {
    return (
        <span className="h-80 animate-bounce absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2  text-white">
            <div className="animate-spin h-fit w-fit" >
                <Icon name="poo" size="2xl" />
            </div>
        </span>
    )
}