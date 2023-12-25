import Link from "next/link";

export default function Logo({
    href
}: {
    href?: string,
}) {
    return (
        <Link className=" font-bold" href={href ?? ""}>
            <span className="text-red-600">PTIT</span> Post-training
        </Link>
    )
}