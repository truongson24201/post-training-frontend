'use client';

import { IStudent, IStudentFlat } from "@/apis/Common";
import { IExam, getExamDetails, getStudentsInExam } from "@/apis/Exam";
import useAlert from "@/hooks/useAlert";
import useLoadingAnimation from "@/hooks/useLoadingAnimation";
import { Order, getComparator, stableSort } from "@/utils/functions/sort";
import React, { useEffect, useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableContainer, TablePagination, TableRow, Button } from "@mui/material";
import EnhancedTableHead from "@/components/table/EnhancedTableHead";
import BackwardButton from "@/components/BackwardButton";
import VerifiedIcon from '@mui/icons-material/Verified';



interface HeadCell {
    id: keyof IStudentFlat;
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
        label: "ID",
        width: "10%"
    },
    {
        id: "fristName",
        numeric: false,
        disablePadding: false,
        label: "Họ",
        width: "30%"
    },
    {
        id: "lastName",
        numeric: false,
        disablePadding: false,
        label: "Tên",
        width: "10%"
    },
    {
        id: "DOB",
        numeric: false,
        disablePadding: false,
        label: "Ngày sinh",
        width: "10%"
    },
    {
        id: "gender",
        numeric: false,
        disablePadding: false,
        label: "Giới tính",
        width: "10%"
    },
    {
        id: "email",
        numeric: false,
        disablePadding: false,
        label: "Email",
        width: "20%"
    },

];


export default function Page({
    params,
}: {
    params: { id: number }
}) {

    const [students, setStudents] = useState<IStudent[]>([]);
    const [fitlerStudents, setFilterStudents] = useState<IStudentFlat[]>([]);
    const loading = useLoadingAnimation();
    const openAlert = useAlert();

    const [order, setOrder] = useState<Order>('desc');
    const [orderBy, setOrderBy] = useState<keyof IStudentFlat>('lastName');
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(15);
    const [exam, setExam] = useState<IExam>();


    useEffect(() => {
        fetchStudentsInExam();
    }, [])

    // useEffect(() => {
    //     if (params.id != undefined)
    //         fetchExamDetails();
    // }, [params.id])

    // async function fetchExamDetails() {
    //     try {
    //         loading(true);
    //         const { data: response } = await getExamDetails(params.id ?? 0);
    //         setExam(response);
    //     }
    //     catch (ex) {

    //     } finally {
    //         loading(false);
    //     }
    // }

    const visibleRows = useMemo(
        () => stableSort(fitlerStudents, getComparator(order, orderBy)).slice(
            page * rowsPerPage,
            page * rowsPerPage + rowsPerPage)
        , [order, orderBy, page, rowsPerPage, fitlerStudents],
    );

    const handleRequestSort = (
        event: React.MouseEvent<unknown>,
        property: keyof IStudentFlat,
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

    async function fetchStudentsInExam() {
        try {
            loading(true);
            const { data: response } = await getStudentsInExam(params.id ?? 0);
            const { data: examRes } = await getExamDetails(params.id ?? 0);
            setExam(examRes);
            setStudents(response);
            const flat: IStudentFlat[] = response.map(s => {
                const fullName = s.profile.fullname;
                const words = fullName.split(" ");
                const lastName = words.pop() ?? ""; // Lấy từ cuối cùng làm tên
                const firstName = words.join(" "); // Các từ còn lại là họ
                return (
                    {
                        studentId: s.studentId,
                        profileId: s.profile.profileId,
                        fristName: firstName,
                        lastName: lastName,
                        DOB: s.profile.DOB,
                        gender: s.profile.gender,
                        email: s.profile.email,
                        phone: s.profile.phone,
                        address: s.profile.address,
                        qualification: s.profile.qualification,
                    }
                )
            }
            )
            setFilterStudents(flat);
        }
        catch (ex) {

        } finally {
            loading(false);
        }
    }

    return (
        <>
            <div className="h-screen w-full border-t-2 p-2 bg-gray-100">
                <section className=" w-full flex flex-col rounded-b-lg overflow-auto bg-default p-2 mt-2 shadow-lg">
                    <div className="flex justify-between m-2">
                        <BackwardButton />
                        <div className="flex justify-start gap-4 ">
                        <p className="bg-green-100 p-2 mb-2 rounded-lg mr-auto"> Môn: {exam?.classCredit.subject}</p>
                        <p className="bg-green-100 p-2 mb-2 rounded-lg mr-auto">Ngày thi: {exam?.examDate}</p>
                        <p className="bg-green-100 p-2 mb-2 rounded-lg mr-auto">Phòng: {exam?.classroomName}</p>
                        <p className="bg-green-100 p-2 mb-2 rounded-lg mr-auto">Hình thức thi: {exam?.classCredit.examType}</p>
                        <p className="bg-green-100 p-2 mb-2 rounded-lg mr-auto">Nhóm thi: {exam?.groupNumber}</p>
                        </div>
                        <Button variant="contained" className="bg-primary" endIcon={<VerifiedIcon />}
                        // onClick={handleSaveClick}
                        >
                            Export
                        </Button>
                    </div>
                    <TableContainer sx={{ maxHeight: 640 }} className="mt-2">
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
                                        <TableRow hover key={row.studentId}

                                        >
                                            {/* <Link href={`recruitments/${row.examPlanId}`}></Link> */}
                                            <TableCell
                                                component="th"
                                                id={labelId}
                                                scope="row"
                                                align="left"
                                            >
                                                {row.studentId}
                                            </TableCell>
                                            <TableCell align="left">{row.fristName}</TableCell>
                                            <TableCell align="left">{row.lastName}</TableCell>
                                            <TableCell align="left">{row.DOB}</TableCell>
                                            <TableCell align="left">{row.gender == true ? "Nam" : "Nữ"}</TableCell>
                                            <TableCell align="left">{row.email}</TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <TablePagination
                        rowsPerPageOptions={[5, 10, 15]}
                        component="div"
                        count={fitlerStudents.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </section>
            </div>
        </>
    )
}