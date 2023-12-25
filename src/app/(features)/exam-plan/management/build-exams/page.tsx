'use client';

import useLoadingAnimation from "@/hooks/useLoadingAnimation";
import useAlert from "@/hooks/useAlert";
import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { IExamPlan, getAllExamPlan } from "@/apis/ExamPlan";
import { ISemester, getAllSemester } from "@/apis/Common";
import { Order, getComparator, stableSort } from "@/utils/functions/sort";
import { SelectChangeEvent, Switch, Table, TableBody, TableCell, TableContainer, TablePagination, TableRow } from "@mui/material";
import EnhancedTableExamPlan from "@/components/ExamPlan/EnhancedTableExamPlan";
import EnhancedTableToolbar from "@/components/table/EnhancedTableToolbar";
import EnhancedTableHead from "@/components/table/EnhancedTableHead";


interface IExamPlanView {
    examPlanId: number,
    dateStart: string,
    dateEnd: string,
    title: string,
    isDelete: string,
    semesterId: string,
    flag: string,
    semester: string,
    status: string,
}

interface HeadCell {
    id: keyof IExamPlanView;
    label: string;
    numeric: boolean;
    disablePadding: boolean;
    width?: string;
}

const headCells: HeadCell[] = [
    {
        id: "title",
        numeric: false,
        disablePadding: false,
        label: "Nội dung",
        width: "30%"
    },
    {
        id: "semester",
        numeric: false,
        disablePadding: false,
        label: "Học kỳ",
        width: "15%"
    },
    {
        id: "dateStart",
        numeric: false,
        disablePadding: false,
        label: "Ngày bắt đầu",
        width: "15%"
    },
    {
        id: "dateEnd",
        numeric: false,
        disablePadding: false,
        label: "Ngày kết thúc",
        width: "10%"
    },
    {
        id: "status",
        numeric: false,
        disablePadding: false,
        label: "Trạng thái",
        width: "10%"
    },
    {
        id: "flag",
        numeric: false,
        disablePadding: false,
        label: "Đăng ký",
        width: "10%"
    },
];

export default function BuildExams({
    url
}: {
    url: string
}) {

    const [examPlans, setExamPlans] = useState<IExamPlanView[]>([]);
    const [filterExamPlans, setFilterExamPlans] = useState<IExamPlanView[]>([]);

    const [semesterId, setSemesterId] = useState('');

    const loading = useLoadingAnimation();
    const openAlert = useAlert();
    const router = useRouter();
    const [checked, setChecked] = React.useState(false);

    const [order, setOrder] = useState<Order>('desc');
    const [orderBy, setOrderBy] = useState<keyof IExamPlanView>('semester');
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(15);

    const visibleRows = useMemo(
        () => stableSort(filterExamPlans, getComparator(order, orderBy)).slice(
            page * rowsPerPage,
            page * rowsPerPage + rowsPerPage)
        , [order, orderBy, page, rowsPerPage, filterExamPlans],
    );

    useEffect(() => {
        fetchAllData();
    }, [checked])


    async function fetchAllData() {
        try {
            loading(true);
            const { data: examplans } = await getAllExamPlan();
            const newRows: IExamPlanView[] = examplans.map(examPlan => ({
                examPlanId: examPlan.examPlanId,
                dateStart: examPlan.dateStart,
                dateEnd: examPlan.dateEnd,
                title: examPlan.title,
                flag: examPlan.flag,
                isDelete: examPlan.isDelete,
                semesterId: examPlan.semester.semesterId,
                status: examPlan.status,
                semester: "Học kỳ " + examPlan.semester.num + ", Năm " + examPlan.semester.year+"-"+(examPlan.semester.year-1+2),
            }));
            setExamPlans(newRows);
            setFilterExamPlans(newRows);
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

    const handleClearFilter = () => {
        setSemesterId('');
    }

    useEffect(() => {
        const newFilteredRows = examPlans.filter(examPlan => {
            const isSameSemester = semesterId ? examPlan.semesterId == semesterId : true;

            if (isSameSemester)
                return true;

            return false;
        });


        setFilterExamPlans(newFilteredRows);
    }, [semesterId])

    const handleRequestSort = (
        event: React.MouseEvent<unknown>,
        property: keyof IExamPlanView,
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

    const handleChangeChecked = async (event: React.ChangeEvent<HTMLInputElement>, bSPatternId: number) => {
        try {
            loading(true);
            // const { data: response } = await openPattern(bSPatternId);
            // openAlert({
            //     severity: "success",
            //     message: response
            // });
            setChecked(event.target.checked);
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
    };


    return (
        <section className="h-screen w-full flex flex-col bg-default">
            <div className="rounded-b-lg overflow-auto p-2 shadow-lg m-2">
                <div className="flex">
                    <EnhancedTableExamPlan
                        semesterId={semesterId}
                        onChangeSemester={(event: SelectChangeEvent) => {
                            setSemesterId(event.target.value as string);
                        }}
                        onClearFilter={handleClearFilter}
                    // onFilter={handleFilter}
                    >
                    </EnhancedTableExamPlan>
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
                                        <TableRow hover key={row.examPlanId}
                                            onClick={() => router.push(`/exam-plan/management/build-exams/${row.examPlanId}`)}
                                        >
                                            {/* <Link href={`recruitments/${row.examPlanId}`}></Link> */}
                                            <TableCell
                                                component="th"
                                                id={labelId}
                                                scope="row"
                                            >
                                                {row.title}
                                            </TableCell>
                                            <TableCell align="left">{row.semester}</TableCell>
                                            <TableCell align="left">{row.dateStart}</TableCell>
                                            <TableCell align="left">{row.dateEnd}</TableCell>
                                            <TableCell align="left">{row.status == true ? (<p className="w-fit p-1 rounded-lg bg-green-100">Đã tạo lịch</p>) : (<p className="w-fit p-1 rounded-lg bg-red-100">Chưa tạo lịch</p>)}</TableCell>
                                            <TableCell align="left">
                                                {row.flag == true ? (<p className="w-fit p-1 rounded-lg bg-green-100">Đang mở</p>) : (<p className="w-fit p-1 rounded-lg bg-red-100">Chưa mở</p>)}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <TablePagination
                        rowsPerPageOptions={[5, 10, 15]}
                        component="div"
                        count={filterExamPlans.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />

            </div >
        </section >
    )
}