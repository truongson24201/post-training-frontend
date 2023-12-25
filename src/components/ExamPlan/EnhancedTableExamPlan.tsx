'use client';
import { ISemester, getAllSemester } from "@/apis/Common";
import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Tooltip } from "@mui/material";
import Button from '@mui/material/Button';
import { DatePicker } from "@mui/x-date-pickers";
import { useEffect, useState } from "react";
import Icon from "../Icon";

interface ITableToolbarProps {
    semesterId: string,
    onChangeSemester: (event: SelectChangeEvent) => void,
    onClearFilter: () => void,
    onFilter?: () => void,

    children?: React.ReactNode,
}

export default function EnhancedTableExamPlan({
    semesterId,
    onChangeSemester,
    onClearFilter,
    onFilter,
    children
}: ITableToolbarProps) {

    const [semesters, setSemesters] = useState<ISemester[]>([]);


    useEffect(() => {
        fetchSemesters();
    }, []);

    async function fetchSemesters() {
        try {
            const { data: response } = await getAllSemester();
            setSemesters(response);
        }
        catch (ex) {

        }
    }


    return (
        <div className="h-20 px-3 flex justify-between items-center">
            <div className="w-full flex gap-10 items-center">
                <FormControl required sx={{ m: 1, minWidth: 220 }}>
                    <InputLabel size="small" id="demo-simple-select-label">Học kỳ</InputLabel>
                    <Select
                        size="small"
                        // className="w-60"
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={semesterId}
                        label="Học kỳ"
                        onChange={onChangeSemester}
                    >
                        <MenuItem value="">
                            <em>None</em>
                        </MenuItem>
                        {semesters.map(d => (
                            <MenuItem value={d.semesterId}>Học kỳ {d.num}, năm {d.year}-{d.year-1+2}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Tooltip title="Clear Filter">
                    <Button
                        color="inherit"
                        onClick={onClearFilter}
                    >
                        <Icon name="square-minus" size="xl" />
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
