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
import { IReward, addRewardsStudents, getRewardsStudents } from "@/apis/reward";
import SaveAltIcon from '@mui/icons-material/SaveAlt';


interface IRewardTable {
    studentId: string,
    fullname: string,
    className: string,
    branch: string,
    email: number,
    DOB: string,
    phone: string,
    gpaFound: number,
    gpaTen: number,
    gpaBehavior: number,
    content: string,
}

interface HeadCell {
    id: keyof IRewardTable;
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
        width: "25%"
    },
    {
        id: "className",
        numeric: false,
        disablePadding: false,
        label: "Lớp",
        width: "10%"
    },
    {
        id: "branch",
        numeric: false,
        disablePadding: false,
        label: "Ngành",
        width: "10%"
    },
    {
        id: "email",
        numeric: false,
        disablePadding: false,
        label: "email",
        width: "10%"
    },
    {
        id: "gpaFound",
        numeric: true,
        disablePadding: false,
        label: "Điểm hệ 4",
        width: "11%"
    },
    {
        id: "gpaBehavior",
        numeric: true,
        disablePadding: false,
        label: "Điểm rèn luyện",
        width: "11%"
    },
    {
        id: "content",
        numeric: false,
        disablePadding: false,
        label: "Loại",
        width: "5%"
    },
];

export default function ViewReward() {
    const loading = useLoadingAnimation();
    const openAlert = useAlert();
    const router = useRouter();
    const popup = usePopup();

    const [facultyId, setFacultyId] = useState<string>('');
    const [faculties, setfaculties] = useState<IFaculty[]>([]);
    const [semesters, setSemesters] = useState<ISemester[]>([]);
    const [semesterId, setSemesterId] = useState<string>('');

    const [rewards, setRewards] = useState<IReward[]>([]);
    const [filterRewards, setFilterRewards] = useState<IReward[]>([]);

    useEffect(() => {
        fetchDataCombobox();
    }, [])

    useEffect(() => {
        if (semesterId != '')
            fetchRewards();
    }, [semesterId])

    async function fetchDataCombobox() {
        try {
            const { data: response } = await getAllFaculty();
            setfaculties(response);
            const { data: res } = await getAllSemester();
            setSemesters(res);
        }
        catch (ex) {

        }
    }

    async function fetchRewards() {
        try {
            const { data: response } = await getRewardsStudents(Number.parseInt(semesterId))
            setRewards(response);
            setFilterRewards(response);
        }
        catch (ex) {

        }
    }

    useEffect(() => {
        if (facultyId != '') {
            const filter = rewards.filter(r => r.student.aClass.faculty.facultyId === Number.parseInt(facultyId))
            setFilterRewards(filter);
        } else setFilterRewards(rewards);
    }, [facultyId])

    return (
        <>
            <div className="h-screen w-full  bg-white overflow-hidden">
                <div className="w-full h-full flex flex-col rounded-xl ">
                    <div className="rounded-b-lg overflow-auto p-2 shadow-lg m-2">
                        <div className="flex gap-5">
                            <FormControl required sx={{ m: 1, minWidth: 220 }}>
                                <InputLabel size="small" id="select-semester">Học kỳ</InputLabel>
                                <Select
                                    labelId="select-semester"
                                    id="semesters"
                                    value={semesterId}
                                    label="Học kỳ*"
                                    size="small"
                                    onChange={(evet: SelectChangeEvent) => {
                                        setSemesterId(evet.target.value);
                                    }}
                                >
                                    {semesters.map((semester, index) => {

                                        return (
                                            <MenuItem value={semester.semesterId}>
                                                <em>Học kỳ {semester.num} năm {semester.year}-{semester.year - 1 + 2}</em>
                                            </MenuItem>
                                        )
                                    })
                                    }
                                </Select>
                                {/* <FormHelperText>Required</FormHelperText> */}
                            </FormControl>
                            <FormControl variant="standard">
                                <InputLabel size="small" id="demo-simple-select-label">Khoa</InputLabel>
                                <Select
                                    size="small"
                                    className="w-60"
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={facultyId}
                                    label="Khoa"
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
                        </div>
                        <TableContainer sx={{ maxHeight: 500 }}>
                            <Table stickyHeader aria-label="sticky table" >
                                <EnhancedTableHead
                                    headCells={headCells}
                                />
                                <TableBody>
                                    {filterRewards.map((row, index) => {
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
                                                <TableCell align="left">{row.student.aClass.faculty.name}</TableCell>
                                                <TableCell align="left">{row.student.profile.email}</TableCell>
                                                <TableCell align="right">{row.gpaReward.totalFourPoint.toFixed(2)}</TableCell>
                                                <TableCell align="right">{row.gpaReward.totalBehaviorPoint.toFixed(2)}</TableCell>
                                                <TableCell align="left">{row.gpaReward.content}</TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 15]}
                            component="div"
                            count={rewards.length}
                            rowsPerPage={0}
                            page={0}
                            onPageChange={() => { }}
                            onRowsPerPageChange={() => { }}
                        />
                    </div>
                </div>
            </div>
        </>
    )
}
