'use client'

import { Table, TableBody, TableCell, TableContainer, TablePagination, TableRow, } from "@mui/material";
import React, { useState, useEffect, useMemo } from "react";
import useAlert from "@/hooks/useAlert";
import useLoadingAnimation from "@/hooks/useLoadingAnimation";
import { isAxiosError } from "axios";
import { FormControl, InputLabel, MenuItem, Select, Tooltip, TextField, Autocomplete, Button } from "@mui/material";
import { IClass, IStudent, getAllClassInExam, getAllStudentInClass, getAllStudents } from "@/apis/Common";
import { ComPointView, ITableScoreStudent, SubjectPointView, getScoreOfStudent } from "@/apis/Scores";
import { useRouter } from "next/navigation";
import EnhancedTableHead from "@/components/table/EnhancedTableHead";
import DoneIcon from '@mui/icons-material/Done';
import usePopup from "@/hooks/usePopup";
import VerifiedIcon from '@mui/icons-material/Verified';

interface ITableScore {
    classCreditId: number,
    subject: string,
    groupNumber: number,
    creditNum: string,
    diemThi: number,
    heMuoi: string,
    heBon: string,
    heChu: string,
    result: string
}

interface HeadCell {
    id: keyof ITableScore;
    label: string;
    numeric: boolean;
    disablePadding: boolean;
    width?: string;
}

const headCells: HeadCell[] = [
    {
        id: "classCreditId",
        numeric: true,
        disablePadding: false,
        label: "LTC ID",
        width: "7%"
    },
    {
        id: "subject",
        numeric: false,
        disablePadding: false,
        label: "Môn học",
        width: "30%"
    },
    {
        id: "creditNum",
        numeric: true,
        disablePadding: false,
        label: "Số tín chỉ",
        width: "10%"
    },
    {
        id: "diemThi",
        numeric: true,
        disablePadding: false,
        label: "Điểm thi",
        width: "10%"
    },
    {
        id: "heMuoi",
        numeric: true,
        disablePadding: false,
        label: "Tổng (10)",
        width: "10%"
    },
    {
        id: "heBon",
        numeric: true,
        disablePadding: false,
        label: "Tổng (4)",
        width: "10%"
    },
    {
        id: "heChu",
        numeric: true,
        disablePadding: false,
        label: "Hệ chữ",
        width: "10%"
    },
    {
        id: "result",
        numeric: false,
        disablePadding: false,
        label: "KQ",
        width: "5%"
    },
];


export default function Page() {
    const loading = useLoadingAnimation();
    const openAlert = useAlert();
    const router = useRouter();
    const popup = usePopup();

    const [students, setStudents] = useState<IStudent[]>([]);
    const [studentId, setStudentId] = useState<string>('');

    const [tableScore, setTableScore] = useState<ITableScoreStudent[]>([]);

    const [classId, setClassId] = useState<number | undefined>();

    const [classes, setClasses] = useState<IClass[]>([]);

    useEffect(() => {
        if (classId != undefined)
            fechAllStudents();
        else {
            setStudents([]);
        }
    }, [classId])

    useEffect(() => {
        fetchAllDataCombox();
    }, [])

    async function fetchAllDataCombox() {
        try {
            loading(true);
            const { data: classesResponse } = await getAllClassInExam();
            classesResponse.sort((a, b) => {
                return b.classId - a.classId
            })
            setClasses(classesResponse);
        }
        catch (ex) {

        } finally {
            loading(false);
        }
    }

    useEffect(() => {
        if (studentId != '')
            fetchTableScore();
    }, [studentId])

    async function fetchTableScore() {
        try {
            const { data: res } = await getScoreOfStudent(studentId);
            setTableScore(res);
        } catch (error) {
            if (isAxiosError(error)) {
                openAlert({
                    severity: "error",
                    message: error.response?.data
                });
            }
        }
    }


    async function fechAllStudents() {
        try {
            loading(true);
            const { data: studentsRes } = await getAllStudentInClass(classId ?? 0);
            setStudents(studentsRes);
        }
        catch (ex) {

        } finally {
            loading(false);
        }
    }


    return (
        <>
            <div className="h-screen w-full p-5 bg-white">
                <div className="w-full h-full flex flex-col rounded-xl overflow-hidden">
                    <section className="h-screen flex flex-col bg-default">
                        <div className="rounded-b-lg overflow-auto p-2 shadow-lg m-2">
                            <div className="flex justify-between m-2">
                                <div className="flex gap-4">
                                    <Autocomplete
                                        onChange={(event, newValue) => {
                                            if (newValue) {
                                                setClassId(newValue.classId);
                                                setStudentId('');
                                                setTableScore([])
                                            } else {
                                                setStudentId('');
                                                setStudents([])
                                                setTableScore([])
                                            }
                                        }}
                                        size="small"

                                        disablePortal
                                        id="combo-box-demo"
                                        options={classes}
                                        sx={{ width: 200 }}
                                        getOptionLabel={option => `${option.classId} | ${option.className}`}
                                        renderInput={(params) => <TextField {...params} placeholder="Chọn lớp*" />}
                                    />
                                    <Autocomplete
                                        onChange={(event, newValue) => {
                                            if (newValue) {
                                                setStudentId(newValue.studentId);
                                            } else {
                                                setTableScore([]);
                                            }
                                        }}
                                        size="small"
                                        disablePortal
                                        id="combo-box-demo"
                                        options={students}
                                        sx={{ width: 300 }}
                                        // getOptionLabel={option =>`${option.studentId} | ${option.profile.fullname}`}
                                        getOptionLabel={(option) =>{
                                            if (studentId != '')
                                                return `${option.studentId} | ${option.profile.fullname}`
                                            else return "";
                                        }}
                                        renderOption={(props, option) => <li {...props}>
                                                {option.studentId} | {option.profile.fullname}        
                                            </li>
                                        }
                                        renderInput={(params) => <TextField {...params} placeholder="Mã số sinh viên*" />}
                                    />
                                </div>
                                <Button variant="contained" className="bg-primary" endIcon={<VerifiedIcon />}
                                // onClick={handleSaveClick}
                                >
                                    Export
                                </Button>
                            </div>
                            <TableContainer sx={{ maxHeight: 660 }}>
                                <Table stickyHeader aria-label="sticky table" >
                                    <EnhancedTableHead
                                        headCells={headCells}
                                    />
                                    <TableBody>
                                        {tableScore.map((row, index) => {
                                            const labelId = `enhanced-table-checkbox-${index}`;

                                            return (
                                                <>
                                                    <TableRow>
                                                        <TableCell colSpan={headCells.length + 1} className="bg-green-200" align="left">
                                                            Học kỳ {row.semester.num}, năm {row.semester.year}-{row.semester.year - 1 + 2}
                                                        </TableCell>
                                                    </TableRow>
                                                    {
                                                        row.subjectPoint.map(point => {
                                                            const com: ComPointView | undefined = point.studentPoint.find(p => p.componentSubject.component.name === "Cuối kỳ");

                                                            return (
                                                                <>
                                                                    <TableRow hover key={point.subject.subjectId} className="cursor-pointer"
                                                                        onClick={() => popup.show(
                                                                            <DetailScore score={point} />
                                                                        )}
                                                                    >
                                                                        {/* <Link href={`recruitments/${row.examPlanId}`}></Link> */}
                                                                        <TableCell
                                                                            component="th"
                                                                            id={labelId}
                                                                            scope="row"
                                                                            align="right"
                                                                        >
                                                                            {point.classCreditId}
                                                                        </TableCell>
                                                                        <TableCell align="left">{point.subject.name}</TableCell>
                                                                        <TableCell align="right">{point.subject.creditNum}</TableCell>
                                                                        {com ?
                                                                            (
                                                                                <TableCell align="right">
                                                                                    {com?.pointNumber.toFixed(2)}
                                                                                </TableCell>
                                                                            ) : (
                                                                                <TableCell align="right">{point.gpa.totalTenPoint.toFixed(2)}</TableCell>
                                                                            )
                                                                        }
                                                                        <TableCell align="right">{point.gpa.totalTenPoint.toFixed(2)}</TableCell>
                                                                        <TableCell align="right">{point.gpa.totalFourPoint.toFixed(2)}</TableCell>
                                                                        <TableCell align="right">{point.gpa.letterPoint}</TableCell>
                                                                        <TableCell align="left">
                                                                            {
                                                                                point.gpa.result === true ? (<p className="p-1 text-center rounded-lg w-14  bg-green-100"><DoneIcon /></p>) : (<p className="p-1 w-14 text-center rounded-lg bg-red-100">X</p>)
                                                                            }

                                                                        </TableCell>

                                                                    </TableRow>
                                                                </>
                                                            )
                                                        })
                                                    }
                                                    <TableRow >
                                                        <TableCell className="" align="left">
                                                        </TableCell>
                                                        <TableCell className="" align="left">
                                                            <p className="font-semibold">Điểm trung bình học kỳ (hệ 4):</p>
                                                        </TableCell>
                                                        <TableCell className="" align="left">
                                                            <p className="font-bold">{row.semesterAverageFour.toFixed(2)}</p>
                                                        </TableCell>
                                                        <TableCell className="border-l-2" align="left">
                                                        </TableCell>
                                                        <TableCell colSpan={2} className="" align="left">
                                                            <p className="font-semibold "> Điểm trung bình (hệ 4):</p>
                                                        </TableCell>
                                                        <TableCell colSpan={2} align="left">
                                                            <p className="font-bold">{row.averageFour.toFixed(2)}</p>
                                                        </TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell className="" align="left">
                                                        </TableCell>
                                                        <TableCell className="" align="left">
                                                            <p className="font-semibold">Điểm trung bình học kỳ (hệ 10)</p>
                                                        </TableCell>
                                                        <TableCell className="" align="left">
                                                            <p className="font-bold">{row.semesterAverageTen.toFixed(2)}</p>
                                                        </TableCell>
                                                        <TableCell className="border-l-2" align="left">
                                                        </TableCell>
                                                        <TableCell colSpan={2} className="" align="left">
                                                            <p className="font-semibold"> Điểm trung bình (hệ 10):</p>
                                                        </TableCell>
                                                        <TableCell colSpan={2} className="" align="left">
                                                            <p className="font-bold">{row.averageTen.toFixed(2)}</p>
                                                        </TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell className="" align="left">
                                                        </TableCell>
                                                        <TableCell className="" align="left">
                                                            <p className="font-semibold">Số tín chỉ học kỳ đạt:</p>
                                                        </TableCell>
                                                        <TableCell className="" align="left">
                                                            <p className="font-bold">{row.semesterCreditNum} </p>
                                                        </TableCell>
                                                        <TableCell className="border-l-2" align="left">
                                                        </TableCell>
                                                        <TableCell colSpan={2} className="" align="left">
                                                            <p className="font-semibold">Tổng số tín chỉ tích lũy:</p>
                                                        </TableCell>
                                                        <TableCell colSpan={2} align="left">
                                                            <p className="font-bold">{row.creditNum} </p>
                                                        </TableCell>
                                                    </TableRow>

                                                </>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </div>

                    </section>
                </div>
            </div>
        </>
    )
}

function DetailScore({
    score
}: {
    score: SubjectPointView
}) {



    return (
        <>
            <section className="flex flex-col gap-5 w-96 py-5 bg-white border-4 border-gray-200 rounded-md zoom-in">
                <div className="flex flex-col items-center gap-5">
                    <h2 className="font-bold text-xl text-slate-600">Môn học: {score.subject.name}</h2>
                    <p className="font-bold text-xl  text-slate-600">Số tín: {score.subject.creditNum}</p>
                </div>
                <div className="flex flex-col items-start gap-5 ml-10">
                    {
                        score.studentPoint.map(s => {
                            return (
                                <>
                                    <div className="flex gap-4">
                                        <p className="bg-green-50 ">{s.componentSubject.component.name}: </p>
                                        <p className="font-bold">{s.pointNumber}</p>
                                    </div>
                                </>
                            )
                        })
                    }
                </div>
            </section>
        </>
    )
}