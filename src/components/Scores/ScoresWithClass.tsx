'use client';


import { Alert, Checkbox, Snackbar, Switch, Tab, Tabs } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import useAlert from "@/hooks/useAlert";
import { InputLabel, MenuItem, Select, SelectChangeEvent, FormControl, Button, TextField, InputAdornment } from "@mui/material";
import useLoadingAnimation from "@/hooks/useLoadingAnimation";
import { IFaculty, ISemester, checkExpiredToEnterPoint, getAllFaculty, getAllSemester } from "@/apis/Common";
import { IClassRegis } from "@/apis/ExamPlan";
import { isAxiosError } from "axios";
import { IComponentPoint, checkHasEnterCK, getAllComponents, getAttendancePoint, getCCToEnterPoint, updateIsComplete } from "@/apis/ClassCredit";
import { Table, TableBody, TableCell, TableContainer, TablePagination, TableRow, TableHead, TableSortLabel } from "@mui/material";
import EnhancedTableHead from "@/components/table/EnhancedTableHead";
import { Order, getComparator, stableSort } from "@/utils/functions/sort";
import { ComPointView, IPoints, IScores, IStatus, StudentPointAdd, getAllStudentsScores, saveStudentsExamStatus, saveStudentsScores, updateAttendancePoint } from "@/apis/Scores";
import SendAndArchiveIcon from '@mui/icons-material/SendAndArchive';
import Popup from "@/hooks/Popup";
import usePopup from "@/hooks/usePopup";
import SaveAltIcon from '@mui/icons-material/SaveAlt';

interface IScoresFlat {
    studentId: string,
    firstName: string,
    lastName: string,
    className: string,
    groupNumber: number,
    DOB: string,
    examStatus: string,
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
        width: "10%"
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
        width: "10%"
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
        id: "examStatus",
        numeric: false,
        disablePadding: false,
        label: "Trạng thái",
        width: "15%"
    },
];


export default function ScoresWithClass() {

    const loading = useLoadingAnimation();
    const openAlert = useAlert();

    const [semesterId, setSemesterId] = useState<number | undefined>();
    const [classCreditId, setClassCreditId] = useState<string>('');
    const [classCredit, setClassCredit] = useState<IClassRegis>();
    const [semesters, setSemesters] = useState<ISemester[]>([]);
    const [classCredits, setClassCredits] = useState<IClassRegis[]>([]);
    const [facultyId, setFacultyId] = useState<string>('');
    const [faculties, setfaculties] = useState<IFaculty[]>([]);
    const [filterClassCredits, setFilterClassCredits] = useState<IClassRegis[]>([]);
    const [studentScores, setStudentScores] = useState<IScores[]>([]);
    const [attendancePoint, setAttendancePoint] = useState<number>();

    const [components, setComponents] = useState<IComponentPoint[]>([]);
    const [expiredToEnter, setExpiredToEnter] = useState<boolean | undefined>(undefined);

    // const [inputPoints, setInputPoints] = useState<IPoints[]>([]);
    const [inputPoints, setInputPoints] = useState<Map<number, Map<number, number>>>(new Map());
    const [inputStatus, setInputStatus] = useState<Map<number, boolean>>(new Map());

    const [hasEnterCK, setHasEnterCK] = useState<boolean | undefined>();

    const convertAndSetInput = (scores: IScores[]) => {
        const newInputPoints = new Map<number, Map<number, number>>();
        const newInputStatus = new Map<number, boolean>();
        let all = true;

        scores.forEach((score) => {
            const { studentPoint, regisClass } = score;
            const { id: regisClassId, examStatus } = regisClass;
            const innerPointMap = new Map<number, number>();

            studentPoint.forEach((point) => {
                const { componentSubject, pointNumber } = point;
                const { comSubId } = componentSubject;

                innerPointMap.set(comSubId, pointNumber);
            });

            newInputPoints.set(regisClassId, innerPointMap);
            newInputStatus.set(regisClassId, examStatus);
            if (examStatus != all)
                all = false;
        });

        setInputPoints(newInputPoints);
        setInputStatus(newInputStatus);
        setIsAllSelected(all);
    };

    const handleInputChange = (
        regisClassId: number,
        comSubId: number,
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const updatedInputPoints = new Map(inputPoints);
        const newInputStatus = new Map(inputStatus);

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

            if (classCredit?.isCompleted === false) {
                const hasZeroPoint = Array.from(regisMap.values()).some((value) => value === 0);
                newInputStatus.set(regisClassId, !hasZeroPoint);
                setInputStatus(newInputStatus);
            }
            
        }

        setInputPoints(updatedInputPoints);
    };

    const handleInputChange1 = (
        regisClassId: number,
        comSubId: number,
        comPointView : ComPointView[],
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const updatedInputPoints = new Map(inputPoints);
        const newInputStatus = new Map(inputStatus);

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

            if (classCredit?.isCompleted === false) {
                const pointZeroGk = comPointView.find(c => c.componentSubject.component.name === "Giữa kỳ")
                const pointZeroChk = comPointView.find(c => c.componentSubject.component.name === "Chuyên cần")
                if (pointZeroGk && pointZeroChk){
                    if (regisMap.get(pointZeroChk.componentSubject.comSubId) === 0 || regisMap.get(pointZeroGk.componentSubject.comSubId) === 0){
                        newInputStatus.set(regisClassId, false);
                        setInputStatus(newInputStatus);
                    }
                }
            }
            
        }

        setInputPoints(updatedInputPoints);
    };

    const handleChangeChecked = (event: React.ChangeEvent<HTMLInputElement>, regisClassId: number, comPointView : ComPointView[]) => {
        if (classCredit && classCredit?.isCompleted === true) {
            openAlert({
                severity: "error",
                message: "Lớp tín chỉ đã cho phép đăng ký thi. không thể thay đổi trạng thái!"
            });
        } else {
            const updatedInputPoints = new Map(inputPoints);
            const regisMap = updatedInputPoints.get(regisClassId);
            const newInputStatus = new Map(inputStatus);
            // Update the status based on the Switch change
            newInputStatus.set(regisClassId, event.target.checked ? true : false);
            if(!newInputStatus.get(regisClassId)){
                // const pointZeroGk = comPointView.find(c => c.componentSubject.component.name === "Giữa kỳ")
                // const pointZeroCk = comPointView.find(c => c.componentSubject.component.name === "Cuối kỳ")
                // comPointView.map(p => regisMap?.set(p.componentSubject.comSubId,0.0))
                // if (pointZeroGk) {
                //     regisMap?.set(pointZeroGk.componentSubject.comSubId, 0.0);
                // }
            
                // Check if pointZeroCk exists before using it
                // if (pointZeroCk) {
                //     regisMap?.set(pointZeroCk.componentSubject.comSubId, 0.0);
                // }
                if (regisMap){
                    updatedInputPoints.set(regisClassId,regisMap);
                    setInputPoints(updatedInputPoints);
                }
            }
            // Set the updated inputStatus state
            setIsAllSelected(false);
            setInputStatus(newInputStatus);
        }
    };

    const handleSelectAllClick = () => {
        if (classCredit && classCredit?.isCompleted === true) {
            openAlert({
                severity: "error",
                message: "Lớp tín chỉ đã cho phép đăng ký thi. không thể thay đổi trạng thái!"
            });
        } else {
            const updatedInputStatus = new Map(inputStatus);
            console.log(inputStatus,"inputStatus")
            console.log(updatedInputStatus,"updatedInputStatus")
            // Nếu đang chọn tất cả
            if (!isAllSelected) {
                updatedInputStatus.forEach((value, key) => {
                    updatedInputStatus.set(key, true);
                });
            } else {
                // Nếu bỏ chọn tất cả
                updatedInputStatus.forEach((value, key) => {
                    updatedInputStatus.set(key, false);
                });
                const scoresTmp:IScores[] = [...studentScores];
                
                const newInputPoints = new Map<number, Map<number, number>>();
                // const newInputStatus = new Map<number, boolean>();
    
                scoresTmp.forEach((score) => {
                    const { studentPoint, regisClass } = score;
                    const { id: regisClassId, examStatus } = regisClass;
                    const innerPointMap = new Map<number, number>();
                    studentPoint.forEach((point) => {
                        const { componentSubject, pointNumber } = point;
                        const { comSubId } = componentSubject;
                        if (componentSubject.component.name === "Cuối kỳ")
                            innerPointMap.set(comSubId, 0.0);
                        else
                            innerPointMap.set(comSubId, pointNumber);
                    });
                    newInputPoints.set(regisClassId, innerPointMap);
                });
                setInputPoints(newInputPoints);
            }
            
            console.log(updatedInputStatus,"updatedInputStatus sauuuuuuuuuuuuuu")
            setInputStatus(updatedInputStatus);
            setIsAllSelected(!isAllSelected);
        }
    };



    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(15);

    const [headCellss, setHeadCells] = useState<HeadCell[]>(headCells);

    useEffect(() => {
        fetchAllSemester();
    }, [])

    useEffect(() => {
        if (classCreditId && classCreditId != '0')
            fetchStudentsScores();
        else setStudentScores([]);
    }, [classCreditId])

    useEffect(() => {
        if (semesterId != undefined)
            fetchClassCredit();
    }, [semesterId])

    async function fetchAllSemester() {
        try {
            // loading(false);
            const { data: response } = await getAllSemester();
            const { data: facultiesRes } = await getAllFaculty();
            setfaculties(facultiesRes);
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

    async function fetchClassCredit() {
        try {
            // loading(false);
            const { data: ccs } = await getCCToEnterPoint(semesterId);
            const {data : checkRes} = await checkExpiredToEnterPoint(semesterId);
            setExpiredToEnter(checkRes);
            setClassCredits(ccs);
            setFilterClassCredits(ccs);
            setFacultyId('');
            setClassCreditId('');
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
            const { data: scores } = await getAllStudentsScores(Number.parseInt(classCreditId));
            setStudentScores(scores);
            const { data: res } = await getAllComponents(Number.parseInt(classCreditId));
            setComponents(res);
            const { data: point } = await getAttendancePoint(Number.parseInt(classCreditId));
            setAttendancePoint(point);
            const {data : hasEnterRes} = await checkHasEnterCK(Number.parseInt(classCreditId));
            setHasEnterCK(hasEnterRes);
            const updatedHeadCells: HeadCell[] = res.map((component) => ({
                id: `${component.name}`,
                numeric: true,
                disablePadding: false,
                label: `${component.name}`,
                width: '13%',
            }));
            const tmp = [
                ...headCells,
                ...updatedHeadCells
            ]
            setHeadCells(tmp);

            convertAndSetInput(scores);
            const clas = classCredits.find(c => c.classCreditId === Number.parseInt(classCreditId));
            setClassCredit(clas);
            if (scores.length === 0){
                openAlert({
                    severity: "error",
                    message: "Lớp này không có sinh viên nào"
                });
            }

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
        const resultArray: IStatus[] = Array.from(inputStatus).map(([regisClassId, examStatus]) => ({
            regisClassId,
            examStatus,
        }));
        if (inputPointsArray.length != 0) {
            try {
                loading(true);
                const { data: res } = await saveStudentsScores(inputPointsArray);
                const { data: resStatus } = await saveStudentsExamStatus(resultArray);
                openAlert({
                    severity: "success",
                    message: res
                });
                fetchStudentsScores();
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

    const hanldeImportPoint = async () => {
        if (classCreditId != '') {
            try {
                loading(true);
                const { data: res } = await updateAttendancePoint(Number.parseInt(classCreditId));
                openAlert({
                    severity: "success",
                    message: res
                });
                fetchStudentsScores();
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
            const filter = classCredits.filter(c => c.facultyId === facultyId);
            setFilterClassCredits(filter);
            setClassCreditId('')
        } else {
            setFilterClassCredits(classCredits);
            setClassCreditId('')
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


    
    const popup = usePopup();
    const completedRequest =
        <Popup text="Bạn có chắc là hoàn thành việc nhập điểm thành phần">
            <Button className="bg-primary m-10 " variant="contained"
                onClick={() => {
                    popup.hide();
                    handleActive();
                }}
            >
                Hoàn thành
            </Button>
            <Button className="bg-primary m-10 " variant="contained"
                onClick={() => {
                    popup.hide();

                }}
            >
                Hủy
            </Button>
        </Popup>;

    const handleActive = async () => {
        try {
            loading(true);
            const { data: res } = await updateIsComplete(Number.parseInt(classCreditId));
            openAlert({
                severity: "success",
                message: res
            });
            fetchStudentsScores();
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

    const handleKeyPress = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
    };

    const [isAllSelected, setIsAllSelected] = useState(false);


    return (
        <div className="flex flex-col h-full w-full ">
            <section className="p-2 bg-default shadow-lg rounded-lg m-2" >
                <div className="flex w-full pb-2 justify-between items-center">
                    <div className=" flex">
                        <FormControl required sx={{ m: 1, minWidth: 220 }}>
                            <InputLabel size="small" id="select-semester">Học kỳ</InputLabel>
                            <Select
                                labelId="select-semester"
                                id="semesters"
                                value={semesterId}
                                label="Học kỳ*"
                                size="small"
                                onChange={(evet: SelectChangeEvent) => {
                                    setSemesterId(Number.parseInt(evet.target.value));
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
                            <InputLabel size="small" id="select-ExamPlan">Lớp tín chỉ</InputLabel>
                            <Select
                                labelId="select-ExamPlan"
                                id="ExamPlan"
                                value={classCreditId}
                                label="Lớp tín chỉ*"
                                size="small"
                                onChange={(event: SelectChangeEvent) => {
                                    setClassCreditId(event.target.value);
                                }}
                            >
                                {filterClassCredits.map((c, index) => {

                                    return (
                                        <MenuItem value={c.classCreditId}>{c.classCreditId} | {c.subject}</MenuItem>
                                    )
                                })
                                }
                            </Select>
                        </FormControl>
                    </div>
                    <div className="flex gap-2 mr-auto items-center w-full">
                        {
                            classCreditId || expiredToEnter ? (classCredit?.subject === "Thực tập" || classCredit?.subject === "Tốt nghiệp" || expiredToEnter ? (
                                <></>
                            ) : (
                                <>
                                    <p className="h-fit p-2 rounded-lg bg-primary text-white ">
                                        điểm chuyên cần: {attendancePoint?.toFixed(2)}đ/1 buổi
                                    </p>
                                    <p className="">=={'>'}</p>
                                    <Button variant="contained" color="primary"
                                        // onClick={handleAddCriteria} 
                                        className="bg-primary mr-40 mt-2"
                                        onClick={hanldeImportPoint}
                                        endIcon={<SaveAltIcon />}
                                    >
                                        Nạp
                                    </Button>
                                </>

                            )) : (
                                <></>
                            )
                        }
                        {
                            classCreditId || expiredToEnter ? (
                                classCredit?.subject === "Thực tập" || classCredit?.subject === "Tốt nghiệp"  || expiredToEnter ? (
                                    <></>
                                ) : (
                                    classCredit?.isCompleted === false ?
                                        (
                                            <div className="ml-auto">
                                                <Button className="bg-primary " variant="contained" endIcon={<SendAndArchiveIcon />}
                                                    onClick={() => {
                                                        popup.show(completedRequest);
                                                    }}
                                                >
                                                    Cho phép thi
                                                </Button>

                                            </div>

                                        ) : (

                                            <p className="bg-green-100  p-3 rounded-lg ml-auto"

                                            >
                                                Đã được phép thi
                                            </p>
                                        )
                                )
                            )
                                : (
                                    <></>
                                )
                        }
                    </div>

                </div>
                <TableContainer sx={{ maxHeight: 500 }}>
                    <Table stickyHeader aria-label="sticky table" >
                        <EnhancedTableHead
                            // onSelectAllClick={handleSelectAllClick}
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
                                console.log(inputStatus.get(row.regisClass.id),"Chan Chan Chan O  day")
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
                                        {/* <TableCell align="left">
                                        {row.regisClass.examStatus == true ? (<p className="p-1 px-1 rounded-lg w-fit bg-green-100">Cho phép</p>) : (<p className="p-1 px-1 w-fit rounded-lg bg-red-100">Cấm thi</p>)}
                                    </TableCell> */}
                                        <TableCell align="left">
                                            <div className="flex items-center justify-between">
                                                {inputStatus.get(row.regisClass.id) ? (<p className="p-1 rounded-lg w-fit bg-green-100">Cho phép</p>) : (<p className="p-1 w-fit rounded-lg bg-red-100">Cấm thi</p>)}
                                                <div className="" >
                                                    <Switch
                                                        checked={inputStatus.get(row.regisClass.id) || false}
                                                        onChange={(event) => handleChangeChecked(event, row.regisClass.id,row.studentPoint)}
                                                        inputProps={{ 'aria-label': 'controlled' }}
                                                        disabled={expiredToEnter}
                                                    />
                                                </div>
                                            </div>
                                        </TableCell>
                                        {
                                            row.studentPoint.map((point, index) => {
                                                return (
                                                    <TableCell align="right">
                                                        {point.componentSubject.component.componentId === 1 ?
                                                            (
                                                                <input
                                                                    className="border-b-slate-200 bg-gray-100 border-r-2 rounded-sm w-24 p-1 bg-transparent  text-end focus:bg-gray-200 focus:outline-primary"
                                                                    type="number"
                                                                    step={attendancePoint?.toFixed(2)}
                                                                    min="0.00"
                                                                    max="10.00"
                                                                    // readOnly
                                                                    value={inputPoints.get(row.regisClass.id)?.get(point.componentSubject.comSubId)?.toFixed(2) ?? ""}
                                                                    // onChange={(e) => handleInputChange(row.regisClass.id, point.componentSubject.comSubId, e)}
                                                                    onChange={(e) => handleInputChange1(row.regisClass.id, point.componentSubject.comSubId,row.studentPoint, e)}
                                                                    onKeyDown={handleKeyPress}
                                                                    disabled={!inputStatus.get(row.regisClass.id) || expiredToEnter}
                                                                />
                                                            ) : (
                                                                <input
                                                                    className="border-b-slate-200 bg-gray-100 border-r-2 rounded-sm w-24 p-1 bg-transparent  text-end focus:bg-gray-200 focus:outline-primary"
                                                                    type="number"
                                                                    step="0.25"
                                                                    min="0.00"
                                                                    max="10.00"
                                                                    value={inputPoints.get(row.regisClass.id)?.get(point.componentSubject.comSubId) ?? ""}
                                                                    // onChange={(e) => handleInputChange(row.regisClass.id, point.componentSubject.comSubId, e)}
                                                                    onChange={(e) => handleInputChange1(row.regisClass.id, point.componentSubject.comSubId,row.studentPoint, e)}
                                                                    // onClick={moveCaretToEnd}
                                                                    onClick={selectAllText}
                                                                    disabled={!inputStatus.get(row.regisClass.id) || expiredToEnter || (point.componentSubject.component.componentId === 5 && !hasEnterCK)}
                                                                />
                                                            )
                                                        }
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

                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        <Checkbox className=""
                            color="primary"
                            checked={isAllSelected}
                            onChange={handleSelectAllClick}
                            inputProps={{ 'aria-label': 'select all' }}
                        />
                        (All)
                    </div>
                    {/* <strong>Name Sub Criteria</strong> */}
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 15]}
                        component="div"
                        count={studentScores.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </div>

            </section>
            {
                classCreditId && !expiredToEnter &&     
                <div className="flex flex-col items-end justify-end h-full mr-4">
                    <Button variant="contained" color="primary"
                        // onClick={handleAddCriteria} 
                        className="bg-primary w-fit"
                        onClick={hanldeSave}
                        endIcon={<SendAndArchiveIcon />}
                    >
                        Lưu
                    </Button>
                </div>
            }
        </div>
    )

}
