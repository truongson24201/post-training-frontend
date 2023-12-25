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
import { IFaculty, ISemester, getAllFaculty, getAllSemester, getCurrentSemester } from "@/apis/Common";
import { AddReward, IReward, addRewardsStudents, checkHasReward, previewRewardsStudents } from "@/apis/reward";
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import PreviewIcon from '@mui/icons-material/Preview';
import Popup from "@/hooks/Popup";
import { IGraduationPreview, IStudentId, addGraduationInternship, previewGraduationsInternship } from "@/apis/Graduations";
import { getAcademicYears } from "@/utils/functions/getAcademicYears";
import { DatePicker, DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";


interface IGraduationTable {
    studentId: string,
    fullname: string,
    className: string,
    email: number,
    DOB: string,
    phone: string,
    gpaFound: number,
    gpaTen: number,
    gpaCreditNum: number,
    gpaPointDMax: number,
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
        width: "25%"
    },
    {
        id: "className",
        numeric: false,
        disablePadding: false,
        label: "Lớp",
        width: "15%"
    },
    {
        id: "email",
        numeric: false,
        disablePadding: false,
        label: "email",
        width: "15%"
    },
    {
        id: "gpaCreditNum",
        numeric: true,
        disablePadding: false,
        label: "Tín chỉ tích lũy",
        width: "10%"
    },
];

export default function GraduationInternshipAdd() {
    const loading = useLoadingAnimation();
    const openAlert = useAlert();
    const router = useRouter();
    const popup = usePopup();

    const [facultyId, setFacultyId] = useState<string>('');
    const [faculties, setfaculties] = useState<IFaculty[]>([]);

    const [graduations, setgraduations] = useState<IGraduationPreview[]>([]);

    const [hasReward, setHasReward] = useState<boolean>(false);
    const [semester, setSemester] = useState<ISemester>();

    // const [gpaFoundMin, setgpaFoundMin] = useState<string>('');
    const [creditMin, setcreditMin] = useState<string>('');
    // const [pointDMax, setpointDMax] = useState<string>('');
    // const [amount, setAmount] = useState<string>('');
    // const [makeYear, setMakeYear] = useState<string>('');


    useEffect(() => {
        fetchDataCombobox();
    }, [])

    // useEffect(() => {
    //     fetchRewards();
    // }, [facultyId, semesterId])

    async function fetchDataCombobox() {
        try {
            const { data: response } = await getAllFaculty();
            const { data: res } = await getCurrentSemester();
            setSemester(res);
            setfaculties(response);
        }
        catch (ex) {

        }
    }

    const handlePostGraInternship = async () => {
        if (graduations.length != 0) {
            try {
                const addGraIntern: IStudentId[] = graduations.map((g: IGraduationPreview) => {
                    return {
                        studentId: g.student.studentId
                    };
                });
                const { data: response } = await addGraduationInternship(Number.parseInt(facultyId), addGraIntern);
                openAlert({
                    severity: "success",
                    message: response
                });
            }
            catch (error) {
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

    // const completedRequest =
    //     <Popup text="Học kỳ và khoa này đã được được xét học bổng, Bạn có chắc chắn muốn cập nhật danh sách không?">
    //         <Button className="bg-primary m-10 " variant="contained"
    //             onClick={() => {
    //                 popup.hide();
    //                 handlePostReward();
    //             }}
    //         >
    //             Cập nhật
    //         </Button>
    //         <Button className="bg-primary m-10 " variant="contained"
    //             onClick={() => {
    //                 popup.hide();

    //             }}
    //         >
    //             Hủy
    //         </Button>
    //     </Popup>;


    const handlePreview = async () => {
        if (facultyId != '' && creditMin != '') {
            try {
                loading(true);
                const { data: response } = await previewGraduationsInternship(
                    Number.parseInt(facultyId),
                    Number.parseInt(creditMin),
                );
                setgraduations(response);
                // const { data: res } = await checkHasReward(Number.parseInt(facultyId), Number.parseInt(semesterId));
                // setHasReward(res);
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
        } else {
            openAlert({
                severity: "error",
                message: "Vui lòng nhập đầy đủ và đúng dữ liệu!"
            });
        }
    }

    useEffect(() =>{
        setgraduations([]);
    },[facultyId,creditMin])

    return (
        <>
            <div className="w-full h-full flex flex-col rounded-xl ">
                <div className="rounded-b-lg overflow-auto p-2 shadow-lg m-2">
                    <div className="grid grid-cols-6 gap-5 items-center mb-4 mt-4 mx-2">
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
                        <TextField
                            placeholder="Lớn hơn hoặc bằng"
                            size="small"
                            label="Tín chỉ tích lũy"
                            value={creditMin}
                            onChange={(e) => {
                                const valueIn = Number.parseInt(e.target.value);
                                if (valueIn >= 0 && valueIn <= 200 || Number.isNaN(valueIn))
                                    setcreditMin(e.target.value)
                            }}
                            // className=" w-60 "
                            type="number"
                            error={creditMin == ""}
                        />
                        {semester && <p className="bg-green-100  rounded-lg p-2 ">Học kỳ {semester?.num} năm {semester?.year}-{semester?.year - 1 + 2}</p>}
                        <Button variant="contained" color="primary"
                            // onClick={handleAddCriteria} 
                            className="bg-primary mr-auto "
                            onClick={handlePreview}
                            endIcon={<PreviewIcon />}
                        >
                            View
                        </Button>
                        <Button variant="contained" color="primary"
                            // onClick={handleAddCriteria} 
                            className="bg-primary ml-auto col-span-2"
                            onClick={handlePostGraInternship}
                            endIcon={<SaveAltIcon />}
                        >
                            Lưu
                        </Button>
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
                                            <TableCell align="left">{row.student.profile.email}</TableCell>
                                            <TableCell align="right">{row.graduationGPA.creditNum}</TableCell>
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
                        onPageChange={() => { }}
                        onRowsPerPageChange={() => { }}
                    />
                </div>
            </div>
        </>
    )
}
