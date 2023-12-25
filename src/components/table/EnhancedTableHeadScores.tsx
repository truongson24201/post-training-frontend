import { Order } from "@/utils/functions/sort";
import { Box, Checkbox, TableCell, TableHead, TableRow, TableSortLabel } from "@mui/material";
import { visuallyHidden } from '@mui/utils';


interface EnhancedTableProps<TData> {
    numSelected?: number;
    rowCount?: number;
    onSelectAllClick?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    isAllSelected?:boolean;
    order?: Order;
    orderBy?: string;
    onRequestSort?: (event: React.MouseEvent<unknown>, property: keyof TData | string) => void;
    headCells: {
        id: keyof TData | string;
        label: string;
        numeric: boolean; // to align
        disablePadding: boolean;
        width?: string;
    }[]
}

export default function EnhancedTableHeadScores<TData>({
    numSelected,
    rowCount,
    onSelectAllClick,
    isAllSelected,
    order,
    orderBy,
    onRequestSort,
    headCells
}: EnhancedTableProps<TData>) {

    const createSortHandler =
        (property: keyof TData | string) =>
        (event: React.MouseEvent<unknown>) =>
        {onRequestSort && 
            onRequestSort(event, property);
        }

    return (
        <TableHead>
            <TableRow> 
                {onSelectAllClick && 
                   <TableCell padding="checkbox" align="left" className="bg-white">
                        <Checkbox
                            color="primary"
                            checked={isAllSelected}
                            onChange={onSelectAllClick}
                            inputProps={{ 'aria-label': 'select all' }}
                        />
                    {/* <strong>Name Sub Criteria</strong> */}
                 </TableCell>
                }
                {headCells.map(headCell => (
                    <TableCell key={headCell.id.toString()}
                        align={headCell.numeric ? 'right' : 'left'}
                        padding={headCell.disablePadding ? 'none' : 'normal'}
                        width={headCell?.width ?? "inherit"}
                        className=" bg-white"
                        // sortDirection={orderBy === headCell.id ? order : false}
                    >
                        <TableSortLabel
                            active={orderBy === headCell.id}
                            direction={orderBy === headCell.id ? order : 'asc'}
                            onClick={createSortHandler(headCell.id)}
                        >
                            {headCell.label}
                            {orderBy === headCell.id ? (
                                <Box component="span" sx={visuallyHidden}>
                                    {order === "desc" ? 'sorted descending' : 'sorted ascending'}
                                </Box>
                            ): null}
                        </TableSortLabel>
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    )
}