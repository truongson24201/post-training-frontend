import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function TableOld ({
    columns,
    dataSet,
    extra,
    linkRoot,
    keyLink,
}: {
    columns: {id: number, text: string, key: string, icon?: string, linkRoot?: string, isImage?: boolean}[],
    dataSet: any[],
    extra?: {
        column: {id: number, text: string},
        node: React.ReactNode,
        handleClick: (val: any) => void,
        key: string,
    },
    linkRoot?:string,
    keyLink?:string,
}) {
    const headerCols = [...columns];
    if (extra) {
        headerCols.push({
            ...extra.column,
            key: "",
        })
    }

    let colsCount = extra ? headerCols.length : columns.length; 
    let count = 0;

    return (
        <section className="flex flex-col h-full">
            <Header columns={headerCols} />
            {
                !linkRoot ? 
                <main className="mt-1 flex flex-col max-h-[560px] overflow-auto">
                {dataSet.map(row => (
                    <div
                        className={`grid grid-cols-${colsCount} min-h-[48px] shrink-0  odd:bg-gray-50 border-2 border-transparent hover:border-gray-300 hover:bg-[#ecf0f1]`}
                    >
                        {
                            columns.map(col => (
                                <div key={col.key + col.text} 
                                className="  col-span-1 grid place-items-center text-left"
                            >
                                {col.isImage 
                                    ? 
                                        <div className="relative w-80 h-52">
                                            <Image
                                                className="object-contain"
                                                src={row[col.key]}
                                                alt="Image"
                                                fill
                                            />
                                        </div>
                                    : row[col.key]
                                }
                                </div>
                            ))
                        }
                        {
                            extra && 
                            <div className="col-span-1 grid place-items-center text-center">
                                <span onClick={() => extra.handleClick(row[extra.key])}>
                                    {extra.node}
                                </span>
                            </div>
                        }
                    </div>
                ))}
                </main> :
                <main className="mt-1 flex flex-col max-h-[560px] overflow-auto">
                {dataSet.map(row => (
                    <Link
                        href={linkRoot + row[keyLink + ""]}
                        key={row.id}
                        className={`grid grid-cols-${colsCount} min-h-[48px] shrink-0   odd:bg-gray-50 border-2 border-transparent hover:border-gray-300 hover:bg-[#ecf0f1]`}
                    >
                        {
                            columns.map(col => (
                                <div key={col.key + col.text} 
                                className="  col-span-1 grid place-items-center text-left"
                            >
                                {col.isImage 
                                    ? 
                                        <div className="relative w-80 h-52">
                                            <Image
                                                className="object-contain"
                                                src={row[col.key]}
                                                alt="Image"
                                                fill
                                            />
                                        </div>
                                    : row[col.key]
                                }
                                </div>
                            ))
                        }
                        {
                            extra && 
                            <div className="col-span-1 grid place-items-center text-left">
                                <span onClick={() => extra.handleClick(row[extra.key])}>
                                    {extra.node}
                                </span>
                            </div>
                        }
                    </Link>
                ))}
            </main>
            }
            
        </section>
    )
}

export const enum ColType {
    Text = "text",
    Link = "link"
}
function Header({
    columns
}: {
    columns: {id: number, text: string, key: string, icon?: string}[],
}) {
    const colsCount = columns.length;
    const headerClassName = `h-11 grid grid-cols-${colsCount} rounded-t-md overflow-hidden text-white`;
    return (
        <header className={headerClassName}>
        {columns.map(col => (
            <div
                key={col.id} 
                className="col-span-1 grid place-items-center font-bold bg-[#34495e] hover:bg-opacity-90">
                {col.text}
            </div>
        ))}
        </header>
    )
}
 