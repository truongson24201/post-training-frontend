import { Order } from "@/utils/functions/sort";
import { Box, Checkbox, TableCell, TableHead, TableRow, TableSortLabel } from "@mui/material";
import { visuallyHidden } from '@mui/utils';


interface EnhancedTableProps<TData> {
    headCells: {
        id: keyof TData;
        label: string;
        numeric: boolean; // to align
        disablePadding: boolean;
        width?: string;
    }[]
}

export default function EnhancedTableHeadNoSort<TData>({
    headCells
}: EnhancedTableProps<TData>) {

  

    return (
        <TableHead>
            <TableRow> 
                {headCells.map(headCell => (
                    <TableCell key={headCell.id.toString()}
                        align={headCell.numeric ? 'right' : 'left'}
                        padding={headCell.disablePadding ? 'none' : 'normal'}
                        width={headCell?.width ?? "inherit"}
                        className=" bg-white"
                        // sortDirection={orderBy === headCell.id ? order : false}
                    > {headCell.label}
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    )
}