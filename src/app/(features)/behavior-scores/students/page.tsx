'use client';


import { IBehaviorScoreView, IPoint, getAllBSStudents, saveBSheet } from "@/apis/BehaviorScores";
import { IBScoreView, IBehaviorScoreDTO, IClass, ISemester, ISubInfo, checkTimeUpdateSheet, getAllClass, getAllSemester, getTotalStudentInClass } from "@/apis/Common";
import useAlert from "@/hooks/useAlert";
import useLoadingAnimation from "@/hooks/useLoadingAnimation";
import { Button, FormControl, FormHelperText, InputLabel, MenuItem, Select, SelectChangeEvent, Table, TableRow, TableCell, TableHead, TableContainer, TextField, TableBody, Autocomplete } from "@mui/material";
import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SendAndArchiveIcon from '@mui/icons-material/SendAndArchive';

interface PointData {
    [key: number]: number;
}

interface FormSheet {
    bSheetId: number,
    behaviorScores: IPoint[]
}


export default function Page() {

    const [semesterId, setSemesterId] = useState<number | undefined>();
    const [classId, setClassId] = useState<number | undefined>();
    const [semesters, setSemesters] = useState<ISemester[]>([]);
    const [classes, setClasses] = useState<IClass[]>([]);
    const [sheet, setSheet] = useState<IBehaviorScoreView>();
    const [index, setIndex] = useState<number>(1);
    const [total, setTotal] = useState<number>(0);

    const [checkSaveSheet, setcheckSaveSheet] = useState<ISubInfo>();
    const loading = useLoadingAnimation();
    const openAlert = useAlert();
    const router = useRouter();

    console.log(sheet)

    const [inputs, setInputs] = useState<IPoint[]>([]);
    const [isChange, setIsChange] = useState<boolean>(false);
    const [totalSelfPoint, setTotalSelfPoint] = useState(0);
    const [totalClassPoint, setTotalClassPoint] = useState(0);
    const [totalAdvisorPoint, setTotalAdvisorPoint] = useState(0);


    function convertToFormSheet(behaviorScoreView: IBehaviorScoreView): IPoint[] {
        const behaviorScores: IBehaviorScoreDTO[] = behaviorScoreView.bScoreContent.flatMap(bscoreView =>
            bscoreView.behaviorScores
        );

        // Map behaviorScores to IPoint objects
        const convertedInputs: IPoint[] = behaviorScores.map(behaviorScore => ({
            bCriteriaSubId: behaviorScore.bCriteriaSub.bCriteriaSubId,
            selfPoint: behaviorScore.selfPoint,
            classPoint: behaviorScore.classPoint,
            advisorPoint: behaviorScore.advisorPoint,
        }));

        const totals = convertedInputs.reduce(
            (accumulator, currentValue) => {
                accumulator.totalSelf += currentValue.selfPoint;
                accumulator.totalClass += currentValue.classPoint;
                accumulator.totalAdvisor += currentValue.advisorPoint;
                return accumulator;
            },
            { totalSelf: 0, totalClass: 0, totalAdvisor: 0 }
        );

        setTotalSelfPoint(totals.totalSelf);
        setTotalClassPoint(totals.totalClass);
        setTotalAdvisorPoint(totals.totalAdvisor);

        return convertedInputs;

    }

    const role: string[] = JSON.parse(localStorage.getItem("roles") ?? "");
    const disableTextField = role.includes("AcademicAdvisor");
    // setSheet(formSheet);

    // console.log(flatSheet,"flatSheet")

    useEffect(() => {
        fetchAllSemester();
    }, [])

    useEffect(() => {
        if (semesterId != undefined && classId != undefined) {
            fetchAllBehaviorStudents(semesterId, classId, 1);
        }
    }, [semesterId, classId])

    useEffect(() => {
        if (semesterId != undefined && classId != undefined && index > 0) {
            fetchAllBehaviorStudents(semesterId, classId, index);
        }
    }, [index])

    useEffect(() => {
        if (semesterId != undefined)
            fetchSubInfo(semesterId);
    }, [semesterId])

    async function fetchAllSemester() {
        try {
            // loading(false);
            const { data: response } = await getAllSemester();
            const { data: classesResponse } = await getAllClass();
            response.sort((a, b) => {
                return b.year - a.year
            })
            setSemesters(response);
            classesResponse.sort((a, b) => {
                return b.classId - a.classId
            })
            setClasses(classesResponse);
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

    async function fetchSubInfo(setSemesterId: number) {
        try {
            // loading(false);
            const { data: response } = await checkTimeUpdateSheet(setSemesterId);
            setcheckSaveSheet(response);
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


    async function fetchAllBehaviorStudents(semesterId: number, classId: number, index: number) {
        try {
            loading(true);
            const { data: response } = await getAllBSStudents(classId, semesterId, index);
            const { data: total } = await getTotalStudentInClass(classId);
            setTotal(total);
            setSheet(response);
            // if(index == 0) setIndex(1);
            setInputs(convertToFormSheet(response))
            setIsChange(false);
            // setFlatSheet(convertToFormSheet(response));

        }
        catch (error) {
            if (isAxiosError(error)) {
                openAlert({
                    severity: "error",
                    message: error.response?.data
                });
            }
            setSheet(null);

        }
        finally {
            loading(false);
        }
    }

    const flatPoints = (inputSeflPoints: { [key: number]: number }, inputClassPoints: { [key: number]: number }, inputAdviorPoints: { [key: number]: number }) => {
        const result = [{}];
        for (const key in inputSeflPoints) {
            if (Object.prototype.hasOwnProperty.call(inputSeflPoints, key)) {
                result[key] = {
                    bCriteriaSubId: key,
                    selfpoint: inputSeflPoints[key],
                    classpoint: inputClassPoints[key],
                    adviorpoint: inputAdviorPoints[key]
                };
            }
        }
        return result;
    };

    function onClickPrevious() {
        const newIndex = index > 1 ? index - 1 : index;
        handlerSave(sheet?.bSheetId ?? 0, inputs);
        setIndex(newIndex);
    }

    function onClickNext() {
        const newIndex = index < total ? index + 1 : index;
        handlerSave(sheet?.bSheetId ?? 0, inputs);
        setIndex(newIndex);
    }

    async function handlerSave(bSheetId: number, inputs: IPoint[]) {
        if (bSheetId != 0 && isChange) {
            try {
                loading(true);
                const { data: response } = await saveBSheet(bSheetId, inputs);
                openAlert({
                    severity: "success",
                    message: response
                });
                setIsChange(false);
            }
            catch (error) {
                if (isAxiosError(error)) {
                    openAlert({
                        severity: "error",
                        message: error.response?.data
                    });
                }

            }
            finally {
                loading(false);
            }
        }

    }

    const handleInputs = (event: React.ChangeEvent<HTMLInputElement>, maxPoint: number, bCriteriaSubId: number, type: string) => {
        let inputValue = parseInt(event.target.value);
        if (isNaN(inputValue)) inputValue = 0;
        // if(inputValue > maxPoint) inputValue = maxPoint;
        // Kiểm tra nếu giá trị nhập vào lớn hơn 0 và nhỏ hơn hoặc bằng maxPoint
        if (inputValue >= 0 && inputValue <= maxPoint) {
            setIsChange(true);

            const updatedInputs = inputs.map(input => {
                if (input.bCriteriaSubId === bCriteriaSubId) {
                    return {
                        ...input,
                        [type]: inputValue,
                    };
                }
                return input;
            });

            setInputs(updatedInputs);
            // Cập nhật tổng số điểm tương ứng
            const totalPoint = updatedInputs.reduce((total, input) => total + input[type === 'selfPoint' ? 'selfPoint' : type === 'classPoint' ? 'classPoint' : 'advisorPoint'], 0);

            if (type === 'selfPoint') {
                setTotalSelfPoint(totalPoint);
            } else if (type === 'classPoint') {
                setTotalClassPoint(totalPoint);
            } else if (type === 'advisorPoint') {
                setTotalAdvisorPoint(totalPoint);
            }
        }


    };

    interface HeadTableSheet {
        ordinal: number;
        content: string;
        // bCriteriaSubId: number;
        description: string;
        maxPoint: number,
        selfPoint: number,
        classPoint: number,
        advisorPoint: number,
    }
    interface HeadCell {
        id: keyof HeadTableSheet;
        label: string;
        numeric: boolean; // to align
        disablePadding: boolean;
        width?: string;
    }

    const headCells: HeadCell[] = [
        // {
        //     id: "ordinal",
        //     numeric: true,
        //     disablePadding: true,
        //     label: "Ordinal",
        //     width: "5%"
        // },
        {
            id: "content",
            numeric: false,
            disablePadding: false,
            label: "Nội dung",
            width: "30%"
        },
        {
            id: "description",
            numeric: false,
            disablePadding: false,
            label: "Mô tả",
            width: "25%"
        },
        {
            id: "maxPoint",
            numeric: true,
            disablePadding: false,
            label: "Điểm tối đa",
            width: "10%"
        },
        {
            id: "selfPoint",
            numeric: true,
            disablePadding: false,
            label: "Cá nhân",
            width: "10%"
        },
        {
            id: "classPoint",
            numeric: true,
            disablePadding: false,
            label: "Lớp chấm",
            width: "10%"
        },
        {
            id: "advisorPoint",
            numeric: true,
            disablePadding: false,
            label: "Cố vấn",
            width: "10%"
        },
    ];

    const calculateTotalPoints = (type: string) => {
        const total = inputs.reduce((acc, input) => {
            if (type === 'selfPoint') {
                acc += input.selfPoint;
            } else if (type === 'classPoint') {
                acc += input.classPoint;
            } else if (type === 'advisorPoint') {
                acc += input.advisorPoint;
            }
            return acc;
        }, 0);

        switch (type) {
            case 'selfPoint':
                setTotalSelfPoint(total);
                break;
            case 'classPoint':
                setTotalClassPoint(total);
                break;
            case 'advisorPoint':
                setTotalAdvisorPoint(total);
                break;
            default:
                break;
        }
    };

    const selectAllText = (event: { target: any; }) => {
        event.target.select();
    };

    return (
        <>
            <div className="h-screen w-full p-5 bg-white">
                <div className="w-full h-full flex flex-col rounded-xl ">
                    <header className="flex-shrink-0 flex items-center gap-4 mb-4">
                        <Autocomplete
                            onChange={(event, newValue) => {
                                if (newValue) {
                                    setSemesterId(Number.parseInt(newValue.semesterId));
                                } else {
                                    setSheet(undefined)
                                }
                            }}
                            size="small"
                            disablePortal
                            id="combo-box-demo"
                            options={semesters}
                            sx={{ width: 240 }}
                            getOptionLabel={option => `Học kỳ ${option.num}, năm ${option.year}`}
                            renderInput={(params) => <TextField {...params} placeholder="Chọn học kỳ" />}
                        />
                        <Autocomplete
                            onChange={(event, newValue) => {
                                if (newValue) {
                                    setClassId(newValue.classId);
                                } else {
                                    setSheet(undefined)
                                }
                            }}
                            size="small"
                            disablePortal
                            id="combo-box-demo"
                            options={classes}
                            sx={{ width: 300 }}
                            getOptionLabel={option => `${option.classId} | ${option.className}`}
                            renderInput={(params) => <TextField {...params} placeholder="Chọn lớp" />}
                        />
                        {checkSaveSheet?.isPermission &&
                            <>
                                <div className="flex-grow flex items-center justify-end gap-2">
                                    <TextField size="small" className="bg-default" label="Date Openning" value={checkSaveSheet?.dateOpen ?? ""} />
                                </div>
                                <Button className="bg-primary ml-auto" variant="contained" endIcon={<SendAndArchiveIcon />}
                                    disabled={!checkSaveSheet}
                                    onClick={() => handlerSave(sheet?.bSheetId ?? 0, inputs)}
                                >
                                    Lưu
                                </Button>
                            </>
                        }
                    </header>
                    <main className="h-full flex flex-col rounded-lg border-2 drop-shadow-sm bg-default ">
                        <section className="flex gap-5 justify-end">
                            <p className="pt-2">Số: {index}/{total}</p>
                            <Button onClick={onClickPrevious}>Trước</Button>
                            <Button onClick={onClickNext}>Sau</Button>
                        </section>
                        <div>
                            <div className="flex gap-4  justify-between mx-24">
                                <h3 className="text-2xl flex flex-col font-bold">
                                    <span>
                                        Học viên Công nghệ Bưu chính
                                    </span>
                                    <span className="ml-14">
                                        Viễn thông cơ sở HCM
                                    </span>
                                </h3>
                                <h3 className="text-lg italic">
                                    Phiếu số: {sheet?.bSheetId ?? ""} - Mẫu
                                </h3>
                            </div>
                            <h1 className="text-3xl font-bold text-center">
                                PHIẾU ĐÁNH GIÁ KẾT QUẢ RÈN LUYỆN
                            </h1>
                            <h4 className="italic text-center mr-96 mt-4">
                                Họ và tên: {sheet?.student?.profile.fullname ?? ""}
                            </h4>
                            <h4 className="italic text-center mr-96 mt-2">
                                Ngày sinh: {sheet?.student?.profile.DOB ?? ""}
                            </h4>
                            <h4 className="italic text-center mr-96 mt-2">
                                MSSV: {sheet?.student?.studentId ?? ""}
                            </h4>
                            <TableContainer sx={{ maxHeight: 470 }} className="bg-slate-100 p-4">
                                <Table stickyHeader aria-label="sticky table" className="h-full">
                                    <TableHead className="bg-red-50">
                                        <TableRow>
                                            {headCells.map(headCell => (
                                                <TableCell key={headCell.id.toString()}
                                                    align={headCell.numeric ? 'right' : 'left'}
                                                    padding={headCell.disablePadding ? 'none' : 'normal'}
                                                    width={headCell?.width ?? "inherit"}
                                                    className=" bg-white"
                                                >{headCell.label}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    {sheet?.bScoreContent.map((row, index) => {
                                        const labelId = `table-sheet-students-${index}`;

                                        return (

                                            <TableBody className="bg-default">
                                                <>
                                                    <TableRow>
                                                        <TableCell colSpan={headCells.length + 1} className="bg-green-200" align="left">Tiêu chí: {row.bCriteria.name}</TableCell>
                                                    </TableRow>
                                                    {row.behaviorScores.map((rowsub, index) => {

                                                        return (
                                                            <>
                                                                <TableRow hover
                                                                    key={rowsub.bCriteriaSub.bCriteriaSubId}
                                                                // className="h-28"
                                                                >
                                                                    {/* <TableCell id={labelId} align="left">{rowsub.bCriteriaSub.bCriteriaSubId}</TableCell> */}
                                                                    <TableCell id={labelId} component="th" scope="row" align="left" >{rowsub.bCriteriaSub.name}</TableCell>
                                                                    <TableCell align="left">{rowsub.bCriteriaSub.description}</TableCell>
                                                                    <TableCell align="right">{rowsub.bCriteriaSub.maxPoint}</TableCell>
                                                                    <TableCell align="right">
                                                                        <TextField
                                                                            label="Cá nhân"
                                                                            value={inputs.find(score => score.bCriteriaSubId === rowsub.bCriteriaSub.bCriteriaSubId)?.selfPoint || "" || "0"}
                                                                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleInputs(event, rowsub.bCriteriaSub.maxPoint, rowsub.bCriteriaSub.bCriteriaSubId, 'selfPoint')}
                                                                            type="number"
                                                                            size="small"
                                                                            inputProps={{
                                                                                min: 0, // Giá trị tối thiểu
                                                                                max: 100, // Giá trị tối đa
                                                                            }}
                                                                            disabled={disableTextField || !checkSaveSheet?.isPermission}
                                                                            onClick={selectAllText}
                                                                        />
                                                                    </TableCell>
                                                                    <TableCell align="right">
                                                                        <TextField
                                                                            label="Lớp"
                                                                            value={inputs.find(score => score.bCriteriaSubId === rowsub.bCriteriaSub.bCriteriaSubId)?.classPoint || "" || "0"}
                                                                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleInputs(event, rowsub.bCriteriaSub.maxPoint, rowsub.bCriteriaSub.bCriteriaSubId, 'classPoint')}
                                                                            size="small"
                                                                            type="number"
                                                                            inputProps={{
                                                                                min: 0, // Giá trị tối thiểu
                                                                                max: 100, // Giá trị tối đa
                                                                            }}
                                                                            disabled={disableTextField || !checkSaveSheet?.isPermission}
                                                                            onClick={selectAllText}
                                                                        />
                                                                    </TableCell>
                                                                    <TableCell align="right">
                                                                        <TextField
                                                                            label="Cố Vấn Học Tập"
                                                                            value={inputs.find(score => score.bCriteriaSubId === rowsub.bCriteriaSub.bCriteriaSubId)?.advisorPoint ?? ""}
                                                                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleInputs(event, rowsub.bCriteriaSub.maxPoint, rowsub.bCriteriaSub.bCriteriaSubId, 'advisorPoint')}
                                                                            size="small"
                                                                            type="number"
                                                                            inputProps={{
                                                                                min: 0, // Giá trị tối thiểu
                                                                                max: 100, // Giá trị tối đa
                                                                            }}
                                                                            onClick={selectAllText}
                                                                            disabled={!checkSaveSheet?.isPermission}
                                                                        />
                                                                    </TableCell>
                                                                </TableRow>
                                                            </>
                                                        )
                                                    })}
                                                </>
                                            </TableBody>
                                        )
                                    })}
                                </Table>
                            </TableContainer>
                        </div>
                    </main>
                    <div className="flex gap-12 px-12 ml-auto py-1">
                        <div className="  bg-primary p-4 w-[110px] h-12  text-white items-center flex font-bold rounded-lg justify-between"
                        >
                            Cá nhân:<span>{totalSelfPoint}</span>
                        </div>
                        <div className="  bg-primary p-4 w-[100px] h-12  text-white items-center flex font-bold rounded-lg justify-between"
                        >
                            Lớp: <span>{totalClassPoint}</span>
                        </div>
                        <div className="  bg-primary p-4 w-[100px] h-12  text-white items-center flex font-bold rounded-lg justify-between"
                        >
                            Cố vấn: <span>{totalAdvisorPoint}</span>
                        </div>
                    </div>
                </div>
            </div >
        </>
    )
}
