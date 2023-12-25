'use client'

import { Table, TableBody, TableCell, TableContainer, TablePagination, TableRow, } from "@mui/material";
import React, { useState, useEffect, useMemo } from "react";
import useAlert from "@/hooks/useAlert";
import useLoadingAnimation from "@/hooks/useLoadingAnimation";
import { isAxiosError } from "axios";
import { FormControl, InputLabel, MenuItem, Select, Tooltip, TextField, Autocomplete, Button, SelectChangeEvent } from "@mui/material";
import { ComPointView, ITableScoreStudent, SubjectPointView, getScoreOfStudent } from "@/apis/Scores";
import { useRouter } from "next/navigation";
import EnhancedTableHead from "@/components/table/EnhancedTableHead";
import DoneIcon from '@mui/icons-material/Done';
import usePopup from "@/hooks/usePopup";
import VerifiedIcon from '@mui/icons-material/Verified';
import { IFaculty, ISemester, getAllFaculty, getAllSemester } from "@/apis/Common";
import { AddReward, IReward, addRewardsStudents, checkHasReward, previewRewardsStudents } from "@/apis/reward";
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import PreviewIcon from '@mui/icons-material/Preview';
import Popup from "@/hooks/Popup";
import { IGraduationPreview, IGradutationView, getGraduations, getGraduationsInternship } from "@/apis/Graduations";
import { getAcademicYears } from "@/utils/functions/getAcademicYears";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";

interface IGraduationTable {
    studentId: string,
    fullname: string,
    className: string,
    email: number,
    supervisor: string,
    thesisAdvisor: string,
    result: string,
    graduationType: string,
    name: string,
    description: string,
}

interface HeadCell {
    id: keyof IGraduationTable;
    label: string;
    numeric: boolean;
    disablePadding: boolean;
    width?: string;
}

const headCells: HeadCell[] = [
    {
        id: "studentId",
        numeric: false,
        disablePadding: false,
        label: "MSSV",
        width: "10%"
    },
    {
        id: "fullname",
        numeric: false,
        disablePadding: false,
        label: "Họ tên",
        width: "15%"
    },
    {
        id: "className",
        numeric: false,
        disablePadding: false,
        label: "Lớp",
        width: "10%"
    },
    // {
    //     id: "email",
    //     numeric: false,
    //     disablePadding: false,
    //     label: "email",
    //     width: "10%"
    // },
    {
        id: "name",
        numeric: false,
        disablePadding: false,
        label: "Tên đề tài",
        width: "15%"
    },
    {
        id: "description",
        numeric: false,
        disablePadding: false,
        label: "Mô tả",
        width: "20%"
    },
    {
        id: "supervisor",
        numeric: false,
        disablePadding: false,
        label: "GV Hướng dẫn",
        width: "11%"
    },
    {
        id: "thesisAdvisor",
        numeric: false,
        disablePadding: false,
        label: "GV phản biện",
        width: "11%"
    },
    {
        id: "result",
        numeric: false,
        disablePadding: false,
        label: "Kết quả",
        width: "11%"
    },
];

export default function GraduationInternshipView() {
    const loading = useLoadingAnimation();
    const openAlert = useAlert();
    const router = useRouter();
    const popup = usePopup();

    const [facultyId, setFacultyId] = useState<string>('');
    const [faculties, setfaculties] = useState<IFaculty[]>([]);

    const [graduations, setgraduations] = useState<IGradutationView[]>([]);


    const [makeYear, setMakeYear] = useState<string>('');


    useEffect(() => {
        fetchDataCombobox();
    }, [])

    useEffect(() => {
        if (facultyId != '' && makeYear != '')
            fetchGraduations();
    }, [facultyId, makeYear])

    async function fetchDataCombobox() {
        try {
            const { data: response } = await getAllFaculty();
            setfaculties(response);
        }
        catch (ex) {

        }
    }

    async function fetchGraduations() {
        try {
            const selectedYear = dayjs(makeYear).format('YYYY');
            const { data: response } = await getGraduationsInternship(Number.parseInt(facultyId), selectedYear);
            setgraduations(response);
        }
        catch (ex) {

        }
    }



    return (
        <>
            <div className="w-full h-full flex flex-col rounded-xl ">
                <div className="rounded-b-lg overflow-auto p-2 shadow-lg m-2">
                    <div className="grid grid-cols-8 gap-5 items-center mb-4 mt-4">
                        <FormControl required>
                            <InputLabel size="small" id="demo-simple-select-label">Khoa</InputLabel>
                            <Select
                                size="small"
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={facultyId}
                                label="Khoa*"
                                onChange={(event: SelectChangeEvent) => {
                                    setFacultyId(event.target.value);
                                }}
                            >
                                <MenuItem value="">
                                    <em>None</em>
                                </MenuItem>
                                {faculties.map(d => (
                                    <MenuItem value={d.facultyId}>{d.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <DatePicker
                            label="Năm thực hiện"
                            value={makeYear}
                            openTo="year"
                            views={['year']}
                            slotProps={{ textField: { size: 'small' } }}
                            onChange={(newDate) => { setMakeYear(newDate ?? '') }}
                        />

                    </div>
                    <TableContainer sx={{ maxHeight: 500 }}>
                        <Table stickyHeader aria-label="sticky table" >
                            <EnhancedTableHead
                                headCells={headCells}
                            />
                            <TableBody>
                                {graduations.map((row, index) => {
                                    const labelId = `enhanced-table-checkbox-${index}`;

                                    return (
                                        <TableRow hover key={row.student.studentId}>
                                            <TableCell
                                                component="th"
                                                id={labelId}
                                                scope="row"
                                                align="left"
                                            >
                                                {row.student.studentId}

                                            </TableCell>
                                            <TableCell align="left">{row.student.profile.fullname}</TableCell>
                                            <TableCell align="left">{row.student.aClass.className}</TableCell>
                                            {/* <TableCell align="left">{row.student.profile.email}</TableCell> */}
                                            <TableCell align="right">{row.name}</TableCell>
                                            <TableCell align="right">{row.description}</TableCell>
                                            <TableCell align="left">{row.supervisor && row.supervisor.profile.fullname}</TableCell>
                                            <TableCell align="left">{row.thesisAdvisor && row.thesisAdvisor.profile.fullname}</TableCell>
                                            <TableCell align="left">{row.result === true ? (<p className="p-1 rounded-lg w-fit bg-green-100">Đậu</p>) : (<p className="p-1 w-fit rounded-lg bg-red-100">Rớt</p>)}</TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>


                    <TablePagination
                        rowsPerPageOptions={[5, 10, 15]}
                        component="div"
                        count={graduations.length}
                        rowsPerPage={0}
                        page={0}
                        onPageChange={() =>{}}
                        onRowsPerPageChange={()=>{}}
                    />
                </div>
            </div>
        </>
    )
}
