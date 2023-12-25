export default function ViewStatus({
    children,
    status
}: {
    children: React.ReactNode,
    status: string;
}) {
    let colorClassName = "";
    if (status == "true") {
        colorClassName = "text-green-sea bg-green-sea";
    } else{
        colorClassName = "text-pumpkin bg-pumpkin";
    }  
    console.log(colorClassName)

    return (
        <span className={`p-2 rounded-md font-bold bg-opacity-10 ${colorClassName}`}>
            {children}
        </span>
    )
} 
