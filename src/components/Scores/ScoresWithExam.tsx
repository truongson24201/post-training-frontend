'use client';


import { Alert, Snackbar, Tab, Tabs } from "@mui/material";
import React, { use, useEffect, useMemo, useState } from "react";
import useAlert from "@/hooks/useAlert";
import { InputLabel, MenuItem, Select, SelectChangeEvent, FormControl, Button, TextField, InputAdornment } from "@mui/material";
import useLoadingAnimation from "@/hooks/useLoadingAnimation";
import { IFaculty, ISemester, checkExpiredToEnterPoint, getAllFaculty, getAllSemester } from "@/apis/Common";
import { IExamPlan, getAllExamPlan } from "@/apis/ExamPlan";
import { isAxiosError } from "axios";
import { IComponentPoint, getAllComponents, getCCSemesterID, getComponent } from "@/apis/ClassCredit";
import { Table, TableBody, TableCell, TableContainer, TablePagination, TableRow, TableHead, TableSortLabel } from "@mui/material";
import EnhancedTableHead from "@/components/table/EnhancedTableHead";
import { IPoints, IScores, IStatus, StudentPointAdd, getAllStudentsScores, getScoresWithExam, saveStudentsScores } from "@/apis/Scores";
import SendAndArchiveIcon from '@mui/icons-material/SendAndArchive';
import { IExam, getAllExam } from "@/apis/Exam";
import { format, parse } from "date-fns";
import dayjs from "dayjs";


interface IScoresFlat {
    studentId: string,
    firstName: string,
    lastName: string,
    className: string,
    groupNumber: number,
    DOB: string,
    component: string,
}

interface HeadCell {
    id: keyof IScoresFlat | string;
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
        width: "15%"
    },
    {
        id: "firstName",
        numeric: false,
        disablePadding: false,
        label: "Họ",
        width: "25%"
    },
    {
        id: "lastName",
        numeric: false,
        disablePadding: false,
        label: "Tên",
        width: "15%"
    },
    {
        id: "className",
        numeric: false,
        disablePadding: false,
        label: "Lớp",
        width: "15%"
    },
    {
        id: "DOB",
        numeric: false,
        disablePadding: false,
        label: "Ngày sinh",
        width: "10%"
    },
    {
        id: "component",
        numeric: true,
        disablePadding: false,
        label: "Cuối kỳ",
        width: "5%"
    },
];


export default function ScoresWithExam() {
    const loading = useLoadingAnimation();
    const openAlert = useAlert();

    const [examPlans, setExamPlans] = useState<IExamPlan[]>([]);
    const [FilterExamPlans, setFilterExamPlans] = useState<IExamPlan[]>([]);
    const [examPlanId, setExamPlanId] = useState<number | undefined>();
    const [exams, setExams] = useState<IExam[]>([]);
    const [examId, setExamId] = useState<string>('');
    const [filterExams, setFilterExams] = useState<IExam[]>([]);
    const [exam, setExam] = useState<IExam>();
    const [hasEnter, setHasEnter] = useState<boolean | undefined>();

    const [semesters, setSemesters] = useState<ISemester[]>([]);
    const [semesterId, setSemesterId] = useState<string>('');

    const [expiredToEnter, setExpiredToEnter] = useState<boolean | undefined>(undefined);


    const [facultyId, setFacultyId] = useState<string>('');
    const [faculties, setfaculties] = useState<IFaculty[]>([]);

    const [studentScores, setStudentScores] = useState<IScores[]>([]);
    const [components, setComponents] = useState<IComponentPoint[]>([]);

    const [inputPoints, setInputPoints] = useState<Map<number, Map<number, number>>>(new Map());
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(15);

    const convertScoresToInputPoints = (scores: IScores[]): Map<number, Map<number, number>> => {
        const inputPointsMap = new Map<number, Map<number, number>>();

        scores.forEach((score) => {
            const regisClassId = score.regisClass.id;
            const studentPoints = score.studentPoint;

            const regisMap = inputPointsMap.get(regisClassId) || new Map<number, number>();

            studentPoints.forEach((studentPoint) => {
                const comSubId = studentPoint.componentSubject.comSubId;
                const pointNumber = studentPoint.pointNumber;

                regisMap.set(comSubId, pointNumber);
            });

            inputPointsMap.set(regisClassId, regisMap);
        });

        return inputPointsMap;
    };

    console.log(studentScores, "studentScores")
    console.log(inputPoints, "inputPoints")


    const handleInputChange = (
        regisClassId: number,
        comSubId: number,
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const updatedInputPoints = new Map(inputPoints);

        if (!updatedInputPoints.has(regisClassId)) {
            updatedInputPoints.set(regisClassId, new Map());
        }

        const regisMap = updatedInputPoints.get(regisClassId);

        if (regisMap) {
            const point = parseFloat(e.target.value);
            const roundedValue = parseFloat(point.toFixed(2));
            const limitedPoint = isNaN(roundedValue) ? 0 : Math.min(Math.max(roundedValue, 0), 10);
            regisMap.set(comSubId, limitedPoint);
            updatedInputPoints.set(regisClassId, regisMap);
        }

        setInputPoints(updatedInputPoints);
    };

    const [headCellss, setHeadCells] = useState<HeadCell[]>(headCells);

    useEffect(() => {
        fetchAllData();
    }, [])

    useEffect(() => {
        if (examId != '')
            fetchStudentsScores();
        else setStudentScores([]);
    }, [examId])

    useEffect(() => {
        if (examPlanId != undefined){
            setExamId('');
            fetchDataExams();
        } else {
            setExamId('');
            setFilterExams([]);
        }
    }, [examPlanId])

    async function fetchAllData() {
        try {
            // loading(false);
            const { data: plans } = await getAllExamPlan();
            setExamPlans(plans);
            setFilterExamPlans(plans);
            const { data: facultiesRes } = await getAllFaculty();
            setfaculties(facultiesRes);
            const { data: response } = await getAllSemester();
            setSemesters(response);
        }
        catch (error) {
            if (isAxiosError(error)) {
                openAlert({
                    severity: "error",
                    message: error.response?.data
                });
            }
            console.log("error", error)
        }
        finally {
            // loading(false);
        }
    }

    const convertDateToTimestamp = (dateString: string): number => {
        const parsedDate = parse(dateString, 'dd/MM/yyyy', new Date());
        return parsedDate.getTime();
    };

    async function fetchDataExams() {
        try {
            // loading(false);
            const { data: res } = await getAllExam(examPlanId ?? 0);
            setExams(res);
            const examPlan = examPlans.find(e => e.examPlanId === examPlanId);
            if (examPlan){
                const {data : checkRes} = await checkExpiredToEnterPoint(Number.parseInt(examPlan?.semester.semesterId));
                setExpiredToEnter(checkRes);
            }
            const sortedExams = [...res].sort((a, b) => {
                return convertDateToTimestamp(a.examDate) - convertDateToTimestamp(b.examDate);
            });

            // Cập nhật sortedExams vào state
            setFilterExams(sortedExams);
        }
        catch (error) {
            if (isAxiosError(error)) {
                openAlert({
                    severity: "error",
                    message: error.response?.data
                });
            }
            console.log("error", error)
        }
        finally {
            // loading(false);
        }
    }

    async function fetchStudentsScores() {
        try {
            loading(false);
            const { data: scores } = await getScoresWithExam(Number.parseInt(examId));
            setStudentScores(scores);
            const examtmp = exams.find(e => e.examId === Number.parseInt(examId));
            setExam(examtmp);
            const inputDate = dayjs(examtmp?.examDate, 'DD/MM/YYYY');
            const currentDate = dayjs();
            if (inputDate.isSame(currentDate, 'day') || inputDate.isAfter(currentDate, 'day')) {
                setHasEnter(true);
            } else {
                setHasEnter(false);
            }
            const inputPointsMap = convertScoresToInputPoints(scores);
            setInputPoints(inputPointsMap);

        }
        catch (error) {
            if (isAxiosError(error)) {
                openAlert({
                    severity: "error",
                    message: error.response?.data
                });
            }
            console.log("error", error)
        }
        finally {
            loading(false);
        }
    }

    const hanldeSave = async () => {
        const inputPointsArray: IPoints[] = Array.from(inputPoints).map(([regisClassId, regisMap]) => {
            const studentPoints: StudentPointAdd[] = Array.from(regisMap).map(([comSubId, pointNumber]) => ({
                comSubId,
                pointNumber
            }));
            return { regisClassId, studentPoints };
        });
        if (inputPointsArray.length != 0) {
            try {
                loading(true);
                const { data: res } = await saveStudentsScores(inputPointsArray);
                openAlert({
                    severity: "success",
                    message: res
                });
            } catch (error) {
                if (isAxiosError(error)) {
                    openAlert({
                        severity: "error",
                        message: error.response?.data
                    });
                }
            } finally {
                loading(false);
            }
        }

    }

    useEffect(() => {
        if (facultyId && facultyId != '0') {
            const filter = exams.filter(e => e.classCredit.facultyId === facultyId);
            const sortedExams = [...filter].sort((a, b) => {
                return convertDateToTimestamp(a.examDate) - convertDateToTimestamp(b.examDate);
            });
            setFilterExams(sortedExams);
            setExamId('')
        } else {
            const sortedExams = [...exams].sort((a, b) => {
                return convertDateToTimestamp(a.examDate) - convertDateToTimestamp(b.examDate);
            });
            setFilterExams(sortedExams);
            setExamId('')
        }
    }, [facultyId])


    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const moveCaretToEnd = (event: { target: any; }) => {
        const input = event.target;
        input.selectionStart = input.selectionEnd = input.value.length;
    };

    const selectAllText = (event: { target: any; }) => {
        event.target.select();
    };

    useEffect(() => {
        if (semesterId != '') {
            const filter = examPlans.filter(e => e.semester.semesterId === semesterId);
            setFilterExamPlans(filter);
            setExamPlanId(undefined);
        } else {
            setExamPlanId(undefined);   
            setFilterExamPlans(examPlans);
            setStudentScores([]);
        }
    }, [semesterId])

    return (
        <>
            <section className="p-2 bg-default shadow-lg rounded-lg m-2" >
                <div className="flex w-full pb-2 justify-between">
                    <div className="">
                        <FormControl variant="standard">
                            <InputLabel size="small" id="select-semester">Học kỳ</InputLabel>
                            <Select
                                className="w-60"
                                labelId="select-semester"
                                id="semesters"
                                value={semesterId}
                                label="Học kỳ*"
                                size="small"
                                onChange={(evet: SelectChangeEvent) => {
                                    setSemesterId(evet.target.value);
                                }}
                            >
                                <MenuItem value=''>
                                    <em>All</em>
                                </MenuItem>
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
                        <FormControl required sx={{ m: 1, minWidth: 220 }}>
                            <InputLabel size="small" id="select-ExamPlan">Kế hoạch thi</InputLabel>
                            <Select

                                labelId="select-ExamPlan"
                                id="ExamPlan"
                                value={examPlanId?? ''}
                                label="Kế hoạch thi*"
                                size="small"
                                onChange={(event: SelectChangeEvent) => {
                                    setExamPlanId(Number.parseInt(event.target.value));
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
                        <FormControl sx={{ m: 1, minWidth: 120 }}>
                            <InputLabel size="small" id="demo-simple-select-label">Ngành</InputLabel>
                            <Select
                                className="w-60"
                                size="small"
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={facultyId}
                                label="Khoa"
                                onChange={(event: SelectChangeEvent) => {
                                    setFacultyId(event.target.value);
                                }}
                            >
                                <MenuItem value="0">
                                    <em>All</em>
                                </MenuItem>
                                {faculties.map(d => (
                                    <MenuItem value={d.facultyId}>{d.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl required sx={{ m: 1, minWidth: 320 }}>
                            <InputLabel size="small" id="select-ExamPlan">Bài thi</InputLabel>
                            <Select
                                labelId="select-ExamPlan"
                                id="ExamPlan"
                                value={examId}
                                label="Bài thi*"
                                size="small"
                                onChange={(event: SelectChangeEvent) => {
                                    setExamId(event.target.value);
                                }}
                            >
                                {filterExams.map((e, index) => {

                                    return (
                                        <MenuItem value={e.examId}>{e.classCredit.subject}, Ngày({e.examDate}), Phòng({e.classroomName}), Ca({e.shiftSystem.timeStart}:{e.shiftSystem.timeClose})</MenuItem>
                                    )
                                })
                                }
                            </Select>
                        </FormControl>
                    </div>
                    {
                        examId &&
                        <Button variant="contained" color="primary"
                            // onClick={handleAddCriteria} 
                            className="bg-primary ml-auto mt-2 mr-2"
                            onClick={hanldeSave}
                            endIcon={<SendAndArchiveIcon />}
                        >
                            Lưu
                        </Button>
                    }
                </div>
                <TableContainer sx={{ maxHeight: 550 }}>
                    <Table stickyHeader aria-label="sticky table" >
                        <EnhancedTableHead
                            // orderBy={orderBy}
                            // order={order}
                            // onRequestSort={handleRequestSort}
                            headCells={headCellss}
                        />
                        <TableBody>
                            {studentScores.map((row, index) => {
                                const labelId = `enhanced-table-checkbox-${index}`;
                                const fullName = row.regisClass.student.profile.fullname;
                                const words = fullName.split(" ");
                                const lastName = words.pop() ?? ""; // Lấy từ cuối cùng làm tên
                                const firstName = words.join(" "); // Các từ còn lại là họ
                                return (
                                    <TableRow hover key={row.regisClass.student.studentId}>
                                        <TableCell
                                            component="th"
                                            id={labelId}
                                            scope="row"
                                            align="left"
                                        >
                                            {row.regisClass.student.studentId}

                                        </TableCell>
                                        <TableCell align="left">{firstName}</TableCell>
                                        <TableCell align="left">{lastName}</TableCell>
                                        <TableCell align="left">{row.regisClass.student.aClass.className}</TableCell>
                                        <TableCell align="left">{row.regisClass.student.profile.DOB}</TableCell>
                                        {
                                            row.studentPoint.map((point, index) => {
                                                return (
                                                    <TableCell align="right">
                                                        <input
                                                            className="border-b-slate-200 bg-gray-100 border-r-2 rounded-sm w-24 p-1 bg-transparent  text-end focus:bg-gray-200 focus:outline-primary"
                                                            type="number"
                                                            step="0.25"  // Bước (step) là 0.01 để cho phép nhập số thực với hai chữ số sau dấu phẩy
                                                            min="0.00"   // Giá trị tối thiểu là 0.00
                                                            max="10.00"
                                                            value={inputPoints.get(row.regisClass.id)?.get(point.componentSubject.comSubId) ?? ""}
                                                            onChange={(e) => handleInputChange(row.regisClass.id, point.componentSubject.comSubId, e)}
                                                            // onClick={moveCaretToEnd}
                                                            onClick={selectAllText}
                                                            disabled={hasEnter || expiredToEnter}
                                                        />
                                                    </TableCell>
                                                )
                                            })
                                        }
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 15]}
                    component="div"
                    count={studentScores.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />

            </section>
        </>
    )

}