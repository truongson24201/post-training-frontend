import Link from "next/link"
import Icon from "./Icon"

export default function BackwardButton({
    href = "./"
}: {
    href?: string
}) {
    return (
        <Link href={href} className="w-9 h-9 grid place-items-center hover:bg-slate-100 rounded-full">
            <Icon name="arrow-left" size="xl" />
        </Link>
    )
}