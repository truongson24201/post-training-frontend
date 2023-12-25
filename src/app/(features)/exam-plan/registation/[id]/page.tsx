'use client';

import useAlert from "@/hooks/useAlert";
import React, { useState, useEffect, useMemo } from "react";
import { SelectChangeEvent, Step, StepLabel, Stepper, Typography, TextField, Button } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { IFaculty, ISemester, getAllFaculty, getCurrentSemester } from "@/apis/Common";
import useLoadingAnimation from "@/hooks/useLoadingAnimation";
import { isAxiosError } from "axios";
import loginImgSrc from "@/features/login/assets/login_02.png";
import CreateIcon from '@mui/icons-material/Create';
import { IClassRegis, IExamPlan, addExamPlan, buildExamScheduling, deleteClassInExamPlan, deleteExamPlan, getAllExamType, getExamPlanDetails, getRegisInExamPlan, regisInExamPlan, updateClassInExamPlan, updateExamPlan } from "@/apis/ExamPlan";
import { useRouter } from "next/navigation";
import Image from "next/image";
import VerifiedIcon from '@mui/icons-material/Verified';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import BackwardButton from "@/components/BackwardButton";
import { Order, getComparator, stableSort } from "@/utils/functions/sort";
import EnhancedRegis from "@/components/ExamPlan/EnhancedRegis";
import { Table, TableBody, TableCell, TableContainer, TablePagination, TableRow } from "@mui/material";
import EnhancedTableHead from "@/components/table/EnhancedTableHead";
import { FormControl, InputLabel, MenuItem, Select, Tooltip } from "@mui/material";
import { checkClassCreditOfLec, getCCToRegis } from "@/apis/ClassCredit";
import SendAndArchiveIcon from '@mui/icons-material/SendAndArchive';
import GroupsIcon from '@mui/icons-material/Groups';
import GroupIcon from '@mui/icons-material/Group';
import usePopup from "@/hooks/usePopup";
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';



interface HeadCell {
    id: keyof IClassRegis;
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
        width: "25%"
    },
    {
        id: "lecturerName",
        numeric: false,
        disablePadding: false,
        label: "Giảng viên",
        width: "15%"
    },
    {
        id: "facultyName",
        numeric: false,
        disablePadding: false,
        label: "Ngành",
        width: "5%"
    },
    {
        id: "numberStudents",
        numeric: true,
        disablePadding: false,
        label: "SL",
        width: "10%"
    },
    {
        id: "numberExamGroups",
        numeric: true,
        disablePadding: false,
        label: "Nhóm thi",
        width: "10%"
    },
    {
        id: "examType",
        numeric: false,
        disablePadding: false,
        label: "Hình thức thi",
        width: "10%"
    },
];

export default function Page({
    params,
}: {
    params: { id: number }
}) {

    const [examPlan, setExamPlan] = useState<IExamPlan>();
    const [regis, setRegis] = useState<IClassRegis[]>([]);
    const [filterRegis, setFilterRegis] = useState<IClassRegis[]>([]);
    const [classCredits, setClassCredits] = useState<IClassRegis[]>([]);
    const [filterClassCredits, setFilterClassCredits] = useState<IClassRegis[]>([]);


    const [facultyId, setFacultyId] = useState('');
    const [classCreditId, setClassCreditId] = useState('');

    const loading = useLoadingAnimation();
    const openAlert = useAlert();
    const router = useRouter();
    const [numberExam, setNumberExam] = useState("1");
    const [examTypes, setExamTypes] = useState<string[]>([]);
    const [examType, setExamType] = useState<string>("");


    const [order, setOrder] = useState<Order>('desc');
    const [orderBy, setOrderBy] = useState<keyof IClassRegis>('facultyName');
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(15);

    const currentDate = dayjs(); // Lấy ngày hiện tại

    // const isDisable = 

    const popup = usePopup();

    // console.log(regisOpeningDate,"regisOpeningDate");
    // console.log(regisClosingDate,"regisClosingDate");
    // console.log(currentDate,"currentDate");
    // console.log(isDisable,"isDisable")

    useEffect(() => {
        fetchExamPlanDetails(params.id);
    }, [])

    async function fetchExamPlanDetails(id: number) {
        try {
            loading(true);
            const { data: examplan } = await getExamPlanDetails(id);
            const { data: regis } = await getRegisInExamPlan(id);
            const { data: ccs } = await getCCToRegis(Number.parseInt(examplan.semester.semesterId));
            const { data: examTypes } = await getAllExamType();
            setExamTypes(examTypes);
            setExamPlan(examplan);
            // list
            setRegis(regis);
            setFilterRegis(regis);
            // const classCreditsNotInRegis = ccs.filter(cc => !regis.some(r => r.classCreditId === cc.classCreditId));
            // combox
            setClassCredits(ccs);
            setFilterClassCredits(ccs);
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



    const handleClearFilter = () => {
        setFacultyId('');
    }

    const visibleRows = useMemo(
        () => stableSort(filterRegis, getComparator(order, orderBy)).slice(
            page * rowsPerPage,
            page * rowsPerPage + rowsPerPage)
        , [order, orderBy, page, rowsPerPage, filterRegis],
    );


    useEffect(() => {
        const newFilteredRows = regis.filter(r => {
            const isSameFaculty = facultyId ? r.facultyId == facultyId : true;
            if (isSameFaculty)
                return true;

            return false;
        });
        const newFilterCombox = classCredits.filter(r => {
            const isSameFaculty = facultyId ? r.facultyId == facultyId : true;

            if (isSameFaculty)
                return true;

            return false;
        });
        // const classCreditsNotInRegis = newFilteredRows.filter(cc => !regis.some(r => r.classCreditId === cc.classCreditId));
        setFilterClassCredits(newFilterCombox);

        setFilterRegis(newFilteredRows);
    }, [facultyId])

    const handleRequestSort = (
        event: React.MouseEvent<unknown>,
        property: keyof IClassRegis,
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


    const handleSaveClick = async () => {
        if (classCreditId && numberExam && examType) {
            try {
                loading(true);
                const { data: res } = await regisInExamPlan(examPlan?.examPlanId ?? 0, Number.parseInt(classCreditId), Number.parseInt(numberExam), examType);
                const regisTmp = [
                    ...regis,
                    res
                ]
                setRegis(regisTmp);
                const regisFilterTmp = [
                    ...filterRegis,
                    res
                ]
                setFilterRegis(regisFilterTmp);

                const updatedCombox = classCredits.filter((item) => item.classCreditId !== res.classCreditId);
                setClassCredits(updatedCombox);
                const upComboxFilter = filterClassCredits.filter((item) => item.classCreditId !== res.classCreditId);
                setFilterClassCredits(upComboxFilter);
                openAlert({
                    severity: "success",
                    message: "Đăng ký thành công"
                });
                // router.push("./");
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
                message: "Thiếu thông tin"
            });
        }
    }

    const [hasMyClass, setHasMyClass] = useState<boolean>(false);

    const handleActive = async (classCreditId: number): Promise<boolean> => {
        try {
          const response = await checkClassCreditOfLec(classCreditId);
          const check = response.data; // Lấy giá trị boolean từ phản hồi
      
          // Xử lý kết quả và trả về
          return check;
        } catch (error) {
          console.error("Error occurred while checking class credit:", error);
          return false;
        }
      };


    return (
        <section className="h-screen w-full flex flex-col bg-default">
            <div className="rounded-b-lg overflow-auto p-2 shadow-lg m-2">
                <div className="flex">
                    <BackwardButton />
                    <p className="bg-green-100 p-2 mb-2 rounded-lg ml-3">{examPlan?.title ?? ""}</p>
                    {
                        examPlan && examPlan.flag === true ? (<p className="ml-auto bg-green-100 p-2 mb-2 rounded-lg">{examPlan?.dateStart}-{'>'}{examPlan?.dateEnd}</p>) : (<p className="ml-auto bg-red-100 p-2 mb-2 rounded-lg">Ngoài thời gian đăng ký</p>)
                    }
                </div>
                <div className="flex justify-between items-center mb-2">
                    <EnhancedRegis
                        facultyId={facultyId}
                        onChangeFaculty={(event: SelectChangeEvent) => {
                            setFacultyId(event.target.value as string);
                        }}
                        onClearFilter={handleClearFilter}
                    // onFilter={handleFilter}
                    >
                    </EnhancedRegis>
                    <p className="mt-6 italic">Tổng số lớp tín chỉ đăng ký: {filterRegis.length}</p>
                    {examPlan && examPlan.flag === true &&
                        <>
                            <div className="flex gap-8 items-center">
                                <FormControl variant="standard" className="ml-auto">
                                    <InputLabel id="demo-simple-select-label">Lớp tín chỉ</InputLabel>
                                    <Select
                                        className="w-60"
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        value={classCreditId}
                                        label="Lớp tín chỉ"
                                        onChange={(event: SelectChangeEvent) => {
                                            setClassCreditId(event.target.value as string);
                                        }}
                                    >
                                        <MenuItem value="">
                                            <em>None</em>
                                        </MenuItem>
                                        {filterClassCredits.map(c => (
                                            <MenuItem value={c.classCreditId}>{c.subject}-({c.numberStudents}{<GroupIcon />})</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <TextField
                                    size="small"
                                    label="Số nhóm thi"
                                    value={numberExam}
                                    onChange={(e) => {
                                        const valueIn = Number.parseInt(e.target.value);
                                        if (valueIn >= 1 && valueIn <= 5 || Number.isNaN(valueIn))
                                            setNumberExam(e.target.value)
                                    }}
                                    className="ml-auto w-44"
                                    type="number"
                                    inputProps={{
                                        min: 1, // Giá trị tối thiểu
                                        max: 5, // Giá trị tối đa
                                    }}
                                    error={numberExam == ""}
                                />
                                <FormControl variant="standard" className="mr-10">
                                    <InputLabel id="demo-simple-select-label">Hình thức thi</InputLabel>
                                    <Select
                                        className="w-60"
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        value={examType}
                                        label="Hình thức thi"
                                        onChange={(event: SelectChangeEvent) => {
                                            setExamType(event.target.value as string);
                                        }}
                                    >
                                        <MenuItem value="">
                                            <em>None</em>
                                        </MenuItem>
                                        {examTypes.map(c => (
                                            <MenuItem value={c}>{c}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </div>
                            <Button className="bg-primary mr-4" variant="contained" endIcon={<BookmarkAddIcon />}
                                onClick={handleSaveClick}
                            >
                                Đăng ký
                            </Button>
                        </>
                    }
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
                                    <TableRow hover key={row.classCreditId}
                                        onClick={async () => {
                                            const check = await handleActive(row.classCreditId);
                                            console.log(check,"check")
                                            check && popup.show(
                                                <ShowClassCredit fetchExamPlanDetails={fetchExamPlanDetails} hidePopup={popup.hide} examPlan={examPlan} classCredit={row} examTypes={examTypes} />
                                            )
                                        }}
                                    >
                                        {/* <Link href={`recruitments/${row.examPlanId}`}></Link> */}
                                        <TableCell
                                            component="th"
                                            id={labelId}
                                            scope="row"
                                            align="right"
                                        >
                                            {row.classCreditId}
                                        </TableCell>
                                        <TableCell align="left">{row.subject}</TableCell>
                                        <TableCell align="left">{row.lecturerName}</TableCell>
                                        <TableCell align="left">{row.facultyName}</TableCell>
                                        <TableCell align="right">{row.numberStudents}</TableCell>
                                        <TableCell align="right">{row.numberExamGroups}</TableCell>
                                        <TableCell align="left">{row.examType}</TableCell>
                                        {/* <TableCell align="left">
                                        <RecruitmentStateChip stateId={row.recruitmentStateId}>
                                            {row.recruitmentStateName}
                                        </RecruitmentStateChip>
                                    </TableCell> */}
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    rowsPerPageOptions={[5, 10, 15]}
                    component="div"
                    count={filterRegis.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </div>
        </section>
    )

}

function ShowClassCredit({
    classCredit,
    examTypes,
    examPlan,
    hidePopup,
    fetchExamPlanDetails
}: {
    classCredit: IClassRegis,
    examTypes: string[],
    examPlan: IExamPlan | undefined,
    hidePopup: () => void,
    fetchExamPlanDetails: (id: number) => Promise<void>
}) {

    const [numberGruops, setNumberGroups] = useState(classCredit.numberExamGroups.toString());
    const [examType, setExamType] = useState<string>(classCredit.examType);
    const loading = useLoadingAnimation();
    const openAlert = useAlert();
    const router = useRouter();


    const handleSaveClick = async () => {
        if (numberGruops.trim() != "" && examType != "") {
            try {
                loading(true);
                const { data: response } = await updateClassInExamPlan(examPlan?.examPlanId ?? 0, classCredit.classCreditId, Number.parseInt(numberGruops), examType);
                openAlert({
                    severity: "success",
                    message: response
                });
                // router.refresh();
                // router.push("./");
                fetchExamPlanDetails(examPlan?.examPlanId ?? 0);
                hidePopup();

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

    const handleDeleteClick = async () => {
        try {
            loading(true);
            const { data: response } = await deleteClassInExamPlan(classCredit.classCreditId);
            openAlert({
                severity: "success",
                message: response
            });
            // router.push("./");
            fetchExamPlanDetails(examPlan?.examPlanId ?? 0);
            hidePopup();

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

    return (
        <>
            <section className="flex flex-col gap-5 w-96 py-5 bg-white border-4 border-gray-200 rounded-md zoom-in items-center">
                <h2 className="font-bold text-xl text-slate-600">{classCredit.subject}</h2>
                <p className="font-bold text-xl  text-slate-600">Ngành: {classCredit.facultyName}</p>
                <p className="font-bold text-xl  text-slate-600">Giảng viên: {classCredit.lecturerName}</p>

                <div className="flex flex-col items-start gap-5">
                    <TextField
                        size="small"
                        label="Số nhóm thi"
                        value={numberGruops}
                        onChange={(e) => {
                            const valueIn = Number.parseInt(e.target.value);
                            if (valueIn >= 1 && valueIn <= 10 || Number.isNaN(valueIn))
                                setNumberGroups(e.target.value)
                        }}
                        className="mt-3 w-60 "
                        type="number"
                        inputProps={{
                            min: 1, // Giá trị tối thiểu
                            max: 10, // Giá trị tối đa
                        }}
                        error={numberGruops == ""}
                    />
                    <FormControl variant="standard" className="mr-10">
                        <InputLabel id="demo-simple-select-label">Hình thức thi</InputLabel>
                        <Select
                            className="w-60"
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={examType}
                            label="Hình thức thi"
                            onChange={(event: SelectChangeEvent) => {
                                setExamType(event.target.value as string);
                            }}
                            error={examType == ""}
                        >
                            <MenuItem value="">
                                <em>None</em>
                            </MenuItem>
                            {examTypes.map(c => (
                                <MenuItem value={c}>{c}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </div>
                <div className="flex justify-center gap-3 mt-10">
                    <Button variant="contained" className="bg-red-500 hover:bg-red-600" endIcon={<NotInterestedIcon />}
                        onClick={handleDeleteClick}
                    >
                        Xóa
                    </Button>
                    <Button variant="contained" className="bg-primary" endIcon={<VerifiedIcon />}
                        onClick={handleSaveClick}
                    >
                        Cập nhật
                    </Button>
                </div>
            </section>
        </>
    )
}