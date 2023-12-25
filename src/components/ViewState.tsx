
export default function ViewState({
    children,
    stateId
}: {
    children: React.ReactNode,
    stateId: number;
}) {
    let colorClassName = "";
    switch (stateId) {
        case 1:
            colorClassName = "text-green-sea bg-green-sea";
            break;
        case 2:
            colorClassName = "text-pumpkin bg-pumpkin";
            break;
        case 3:
            colorClassName = "text-belize-hole bg-belize-hole";
            break;
        case 4:
            colorClassName = "text-wisteria bg-wisteria";
            break;
        case 5:
            colorClassName = "text-orange bg-orange";
            break;
        case 6:
            colorClassName = "text-pomegranate bg-pomegranate";
            break;
    }    

    return (
        <span className={`p-2 rounded-md font-bold bg-opacity-10 ${colorClassName}`}>
            {children}
        </span>
    )
} 