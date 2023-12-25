'use client';
import { getAllFaculty, IFaculty } from "@/apis/Common";
import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Tooltip } from "@mui/material";
import Button from '@mui/material/Button';
import { DatePicker } from "@mui/x-date-pickers";
import { useEffect, useState } from "react";
import Icon from "../Icon";

interface ITableToolbarProps {
    facultyId: string,
    onChangeFaculty: (event: SelectChangeEvent) => void,
    onClearFilter: () => void,
    onFilter?: () => void,

    children?: React.ReactNode,
}

export default function EnhancedRegis({
    facultyId,
    onChangeFaculty,
    onClearFilter,
    onFilter,
    children
}: ITableToolbarProps) {

    const [faculties, setfaculties] = useState<IFaculty[]>([]);


    useEffect(() => {
        fetchfaculties();
    }, []);     

    async function fetchfaculties() {
        try {
            const { data: response } = await getAllFaculty();
            setfaculties(response);
        }
        catch(ex) {
            
        }
    }


    return (
        <div className="my-1 px-3 flex justify-between items-center">
            <div className="w-full flex gap-6 items-center">
                <FormControl variant="standard">
                    <InputLabel id="demo-simple-select-label">Ngành</InputLabel>
                    <Select
                        className="w-60"
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={facultyId}
                        label="Ngành"
                        onChange={onChangeFaculty}
                    >
                        <MenuItem value="">
                            <em>None</em>
                        </MenuItem>
                        {faculties.map(d => (
                            <MenuItem value={d.facultyId}>{d.name}</MenuItem>
                        ))} 
                    </Select>
                </FormControl>
                <Tooltip title="Clear Filter"> 
                    <Button
                        color="inherit"
                        onClick={onClearFilter}
                    >
                        <Icon name="square-minus" size="xl"/>
                    </Button>
                </Tooltip>        
                {/* <Tooltip title="Filter"> 
                    <Button
                        color="inherit"
                        onClick={onFilter}
                    >
                        <Icon name="filter" size="xl"/>
                    </Button>
                </Tooltip> */}
            </div>

            <div className="flex gap-3">
                {children}
            </div>
        </div>
    )
}
