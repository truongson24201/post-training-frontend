'use client';

import useLoadingAnimation from "@/hooks/useLoadingAnimation";
import useAlert from "@/hooks/useAlert";
import { useRouter } from "next/navigation";
import React, { use, useEffect, useMemo, useState } from "react";
import moment from "moment";
import { addDays, addWeeks, endOfWeek, format, isSameDay, parse, startOfWeek, subWeeks } from "date-fns";
import { IFaculty, ISemester, IShiftSystem, IStudent, getAllFaculty, getAllSemester, getShiftSystemExam } from "@/apis/Common";
import { IExam, getAllExam, getExamDetails, getStudentsInExam } from "@/apis/Exam";
import { InputLabel, MenuItem, Select, SelectChangeEvent, FormControl, Button, TextField } from "@mui/material";
import { IExamPlan, getAllExamPlan, getAllExamPlanHasBuild } from "@/apis/ExamPlan";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { Order, getComparator, stableSort } from "@/utils/functions/sort";
import BackwardButton from "../BackwardButton";
import EnhancedTableHead from "../table/EnhancedTableHead";
import { Table, TableBody, TableCell, TableContainer, TablePagination, TableRow } from "@mui/material";
import { fi } from "date-fns/locale";
import InfoIcon from '@mui/icons-material/Info';
import Icon from "../Icon";
import Autocomplete from '@mui/material/Autocomplete';


interface IExamTable {
    examId: number,
    examDate: string,
    groupNumber: number,
    examType: string,
    shiftSystem: number,
    timeStart: string,
    timeEnd: string,
    subject: string,
    classroomName: string
    studentSize: number,
    facultyName: string,
    facultyId: number,
}

interface HeadCell {
    id: keyof IExamTable;
    label: string;
    numeric: boolean;
    disablePadding: boolean;
    width?: string;
}

const headCells: HeadCell[] = [
    {
        id: "subject",
        numeric: false,
        disablePadding: false,
        label: "Môn học",
        width: "30%"
    },
    {
        id: "facultyName",
        numeric: false,
        disablePadding: false,
        label: "Khoa",
        width: "15%"
    },
    {
        id: "groupNumber",
        numeric: true,
        disablePadding: false,
        label: "Nhóm thi",
        width: "10%"
    },
    {
        id: "examDate",
        numeric: false,
        disablePadding: false,
        label: "Ngày thi",
        width: "10%"
    },
    {
        id: "classroomName",
        numeric: false,
        disablePadding: false,
        label: "Phòng",
        width: "15%"
    },
    {
        id: "shiftSystem",
        numeric: true,
        disablePadding: false,
        label: "Ca",
        width: "10%"
    },
    {
        id: "examType",
        numeric: false,
        disablePadding: false,
        label: "Hình thức",
        width: "10%"
    },
    {
        id: "studentSize",
        numeric: true,
        disablePadding: false,
        label: "SL",
        width: "5%"
    },
];

export default function GeneralCalendar() {

    const loading = useLoadingAnimation();
    const openAlert = useAlert();

    const [examPlans, setExamPlans] = useState<IExamPlan[]>([]);
    const [semesters, setSemesters] = useState<ISemester[]>([]);
    const [semesterId, setSemesterId] = useState<number | undefined>();
    const [FilterExamPlans, setFilterExamPlans] = useState<IExamPlan[]>([]);
    const [examPlanId, setExamPlanId] = useState<string>('');
    const [exams, setExams] = useState<IExam[]>([]);
    const [filterExams, setFilterExams] = useState<IExamTable[]>([]);

    const [facultyId, setFacultyId] = useState<number | undefined>();
    const [faculties, setfaculties] = useState<IFaculty[]>([]);

    const [order, setOrder] = useState<Order>('desc');
    const [orderBy, setOrderBy] = useState<keyof IExamTable>('examDate');
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(15);
    const router = useRouter();

    useEffect(() => {
        fetchAllDataFilter();
    }, [])

    useEffect(() => {
        if (examPlanId != '')
            fetchAllExams();
        else setFilterExams([]);
    }, [examPlanId])

    // useEffect(() => {
    //     if (examId != undefined)
    //         fetchExamDetails();
    // }, [examId])


    useEffect(() => {
        fetchDataCombobox();
    }, []);

    async function fetchDataCombobox() {
        try {
            const { data: response } = await getAllFaculty();
            setfaculties(response);
            const { data: seRes } = await getAllSemester();
            setSemesters(seRes);
        }
        catch (ex) {

        }
    }

    async function fetchAllDataFilter() {
        try {
            loading(true);
            const { data: plans } = await getAllExamPlanHasBuild();
            setExamPlans(plans);
            setFilterExamPlans(plans);
        }
        catch (ex) {

        } finally {
            loading(false);
        }
    }

    useEffect(() => {
        if (semesterId) {
            const filter = examPlans.filter(ep => Number.parseInt(ep.semester.semesterId) === semesterId);
            setFilterExamPlans(filter);
            setExamPlanId('');
        }
        else {
            setExamPlanId('');
        }
    }, [semesterId])

    async function fetchAllExams() {
        try {
            loading(true);
            const { data: response } = await getAllExam(Number.parseInt(examPlanId) ?? 0);
            setExams(response);
            const mapTo: IExamTable[] = response.map(e => ({
                subject: e.classCredit.subject,
                examId: e.examId,
                examDate: e.examDate,
                groupNumber: e.groupNumber,
                examType: e.classCredit.examType,
                shiftSystem: e.shiftSystem.shiftSystemId,
                timeStart: e.shiftSystem.timeStart,
                timeEnd: e.shiftSystem.timeClose,
                classroomName: e.classroomName,
                studentSize: e.studentSize,
                facultyName: e.classCredit.facultyName,
                facultyId: Number.parseInt(e.classCredit.facultyId),
            }));
            setFilterExams(mapTo);
        }
        catch (ex) {

        } finally {
            loading(false);
        }
    }

    // async function fetchExamDetails() {
    //     try {
    //         loading(true);
    //         const { data: response } = await getExamDetails(examId ?? 0);
    //         setExam(response);
    //     }
    //     catch (ex) {

    //     } finally {
    //         loading(false);
    //     }
    // }



    const visibleRows = useMemo(
        () => stableSort(filterExams, getComparator(order, orderBy)).slice(
            page * rowsPerPage,
            page * rowsPerPage + rowsPerPage)
        , [order, orderBy, page, rowsPerPage, filterExams],
    );

    const handleRequestSort = (
        event: React.MouseEvent<unknown>,
        property: keyof IExamTable,
    ) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    }

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    useEffect(() => {
        const newFilteredRows = exams.filter(e => {
            const isSameFaculty = facultyId ? Number.parseInt(e.classCredit.facultyId) == facultyId : true;
            if (isSameFaculty)
                return true;

            return false;
        });
        const mapTo: IExamTable[] = newFilteredRows.map(e => ({
            subject: e.classCredit.subject,
            examId: e.examId,
            examDate: e.examDate,
            groupNumber: e.groupNumber,
            examType: e.classCredit.examType,
            shiftSystem: e.shiftSystem.shiftSystemId,
            timeStart: e.shiftSystem.timeStart,
            timeEnd: e.shiftSystem.timeClose,
            classroomName: e.classroomName,
            studentSize: e.studentSize,
            facultyName: e.classCredit.facultyName,
            facultyId: Number.parseInt(e.classCredit.facultyId),
        }));

        setFilterExams(mapTo);

    }, [facultyId])


    return (
        <>
            <section className="h-full w-full flex flex-col rounded-b-lg overflow-auto bg-default p-2">
                <div className="flex gap-4 items-center my-3 mx-2">
                    <FormControl variant="standard" sx={{ minWidth: 220 }}>
                        <InputLabel size="small" id="select-ExamPlan">Học kỳ</InputLabel>
                        <Select

                            labelId="select-ExamPlan"
                            id="Semester"
                            value={semesterId}
                            label="Học kỳ"
                            size="small"
                            onChange={(event: SelectChangeEvent) => {
                                setSemesterId(Number.parseInt(event.target.value));
                            }}
                        >
                            <MenuItem value="">
                                <em>None</em>
                            </MenuItem>
                            {semesters.map((semester, index) => {

                                return (
                                    <MenuItem value={semester.semesterId}>
                                        <em>Học kỳ {semester.num}, năm {semester.year}-{semester.year - 1 + 2}</em>
                                    </MenuItem>
                                )
                            })
                            }
                        </Select>
                    </FormControl>
                    <div className="">{'<'}--{'>'}</div>
                    <FormControl required sx={{ minWidth: 200 }}>
                        <InputLabel size="small" id="select-ExamPlan">Kế hoạch thi</InputLabel>
                        <Select

                            labelId="select-ExamPlan"
                            id="ExamPlan"
                            value={examPlanId}
                            label="Kế hoạch thi*"
                            size="small"
                            onChange={(event: SelectChangeEvent) => {
                                setExamPlanId(event.target.value);
                            }}
                        >
                            {FilterExamPlans.map((exam, index) => {

                                return (
                                    <MenuItem value={exam.examPlanId}>
                                        <em>{exam.title} ({exam.dateStart}-{exam.dateEnd})</em>
                                    </MenuItem>
                                )
                            })
                            }
                        </Select>
                    </FormControl>
                    <div className="">----------</div>
                    <FormControl variant="standard">
                        <InputLabel id="demo-simple-select-label">Khoa</InputLabel>
                        <Select
                            className="w-60"
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={facultyId}
                            label="Faculty"
                            onChange={(event: SelectChangeEvent) => {
                                setFacultyId(Number.parseInt(event.target.value));
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
                            orderBy={orderBy}
                            order={order}
                            onRequestSort={handleRequestSort}
                            headCells={headCells}
                        />
                        <TableBody>
                            {visibleRows.map((row, index) => {
                                const labelId = `enhanced-table-checkbox-${index}`;

                                return (
                                    <TableRow hover key={row.examId}

                                    >
                                        {/* <Link href={`recruitments/${row.examPlanId}`}></Link> */}
                                        <TableCell
                                            component="th"
                                            id={labelId}
                                            scope="row"
                                            align="left"
                                        >
                                            {row.subject}
                                        </TableCell>
                                        <TableCell align="left">{row.facultyName}</TableCell>
                                        <TableCell align="right">{row.groupNumber}</TableCell>
                                        <TableCell align="left">{row.examDate}</TableCell>
                                        <TableCell align="left">{row.classroomName}</TableCell>
                                        <TableCell align="right">{row.timeStart} -{'>'} {row.timeEnd}  </TableCell>
                                        <TableCell align="left">{row.examType}</TableCell>
                                        <TableCell align="right" className="cursor-pointer"
                                            onClick={() => router.push(`exam/${row.examId}`)}
                                        >{row.studentSize} <Icon name="clipboard-list" /> </TableCell>

                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    rowsPerPageOptions={[5, 10, 15]}
                    component="div"
                    count={filterExams.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </section>
        </>
    )
}