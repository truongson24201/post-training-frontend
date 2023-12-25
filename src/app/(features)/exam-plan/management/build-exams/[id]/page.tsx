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
import { Order, getComparator, stableSort } from "@/utils/functions/sort";
import EnhancedRegis from "@/components/ExamPlan/EnhancedRegis";
import { Table, TableBody, TableCell, TableContainer, TablePagination, TableRow } from "@mui/material";
import EnhancedTableHead from "@/components/table/EnhancedTableHead";
import { FormControl, InputLabel, MenuItem, Select, Tooltip } from "@mui/material";
import { getCCToRegis } from "@/apis/ClassCredit";
import SendAndArchiveIcon from '@mui/icons-material/SendAndArchive';
import GroupsIcon from '@mui/icons-material/Groups';
import GroupIcon from '@mui/icons-material/Group';
import usePopup from "@/hooks/usePopup";
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import Icon from "@/components/Icon";
import BackwardButton from "@/components/BackwardButton";
import Link from "next/link"


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


    const [facultyId, setFacultyId] = useState('');

    const loading = useLoadingAnimation();
    const openAlert = useAlert();
    const router = useRouter();

    const [order, setOrder] = useState<Order>('desc');
    const [orderBy, setOrderBy] = useState<keyof IClassRegis>('facultyName');
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(15);
    const [faculties, setfaculties] = useState<IFaculty[]>([]);


    const popup = usePopup();

    useEffect(() => {
        fetchExamPlanDetails(params.id);
    }, [])

    useEffect(() => {
        if (facultyId != '') {
            const filter = regis.filter(e => e.facultyId == facultyId);
            setFilterRegis(filter);
        } else setFilterRegis(regis);

    }, [facultyId])

    async function fetchExamPlanDetails(id: number) {
        try {
            loading(true);
            const { data: examplan } = await getExamPlanDetails(id);
            const { data: regis } = await getRegisInExamPlan(id);
            setExamPlan(examplan);
            const { data: response } = await getAllFaculty();
            setfaculties(response);
            // list
            setRegis(regis);
            setFilterRegis(regis);
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


    const visibleRows = useMemo(
        () => stableSort(filterRegis, getComparator(order, orderBy)).slice(
            page * rowsPerPage,
            page * rowsPerPage + rowsPerPage)
        , [order, orderBy, page, rowsPerPage, filterRegis],
    );

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


    const handleActive = async () => {
        try {
            loading(true);
            const { data: res } = await buildExamScheduling(examPlan?.examPlanId ?? 0);
            openAlert({
                severity: "success",
                message: res
            });
            router.push(`/exam`)
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

    const role: string[] = JSON.parse(localStorage.getItem("roles") ?? "");
    const disable = role.includes("lecturer");

    const handleClearFilter = () => {
        setFacultyId('');
    }

    return (
        <section className="h-screen w-full flex flex-col bg-default">
            <div className="rounded-b-lg overflow-auto p-2 shadow-lg m-2">
                <div className="flex">
                    <Link href="/exam-plan/management" className="w-9 h-9 grid place-items-center hover:bg-slate-100 rounded-full">
                        <Icon name="arrow-left" size="xl" />
                    </Link>
                    <p className="bg-green-100 p-2 mb-2 rounded-lg ml-3">{examPlan?.title ?? ""}</p>
                    <p className="ml-auto bg-green-100 p-2 mb-2 rounded-lg">{examPlan?.dateStart}-{'>'}{examPlan?.dateEnd}</p>
                </div>
                <div className="flex justify-start gap-6 items-center mb-2 mx-4">
                    <FormControl variant="standard">
                        <InputLabel id="demo-simple-select-label">Ngành</InputLabel>
                        <Select
                            className="w-60"
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={facultyId}
                            label="Ngành"
                            onChange={(event: SelectChangeEvent) => {
                                setFacultyId(event.target.value as string);
                            }}
                        >
                            <MenuItem value="">
                                <em>All</em>
                            </MenuItem>
                            {faculties.map(d => (
                                <MenuItem value={d.facultyId}>{d.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Tooltip title="Clear Filter">
                        <Button
                            color="inherit"
                            onClick={handleClearFilter}
                        >
                            <Icon name="square-minus" size="xl" />
                        </Button>
                    </Tooltip>
                    <p className="mt-6 italic w-76">Tổng số lớp tín chỉ đăng ký: {filterRegis.length}</p>

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
                {!disable &&
                    <div className="flex justify-end">
                        <div>

                        </div>
                        <Button className="bg-primary mr-4 ml-auto" variant="contained" endIcon={<SendAndArchiveIcon />}
                            onClick={handleActive}
                        >
                            Tạo lịch thi
                        </Button>
                    </div>
                }
            </div>
        </section>
    )

}
