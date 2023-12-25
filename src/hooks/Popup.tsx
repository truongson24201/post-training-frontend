import Image from "next/image";

export default function Popup({
    text,
    children
}: {
    text: string,
    children: React.ReactNode
}) {
    return (
        <section className="flex flex-col gap-5 w-96 py-5 bg-white border-4 border-gray-200 rounded-md zoom-in">
            <div className="relative h-28">
                <Image
                    className="object-contain"
                    src="/question.svg"
                    alt="Question illustration"
                    fill 
                />
            </div>
            <p className="text-center font-bold ">{text}</p>
            <div className="flex justify-center gap-3">
                {children}
            </div>
        </section>
    )
}