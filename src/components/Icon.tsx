import { DetailedHTMLProps, HTMLAttributes } from "react";

interface IIconProps {
    name: string,
    size?: 'lg' | 'xl' | '2xl' | '3xl' | '',
    type?: 'solid' | 'brands',
    pointer?:string
}

export default function Icon({
    name,
    size = '',
    type = 'solid',
    pointer = ''
}: IIconProps) {
    return (
        <span className={pointer && `cursor-pointer`}>
            <i className={`fa-${type} fa-${name} fa-${size}`}></i>
        </span>
    )
}