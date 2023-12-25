'use client';

import { IBCriteria, IBCriteriaSub, addCriteriSub, addCriteria, deleteCriteria, deleteCriteriaSub, editCriteria, editCriteriaSub, getAllBCriteria, getAllBCriteriaSub, getCriteriaDetail, getCriteriaSubDetail } from "@/apis/BehaviorPatterns";
import useAlert from "@/hooks/useAlert";
import useLoadingAnimation from "@/hooks/useLoadingAnimation";
import { Button, Grid, Paper, TextField } from "@mui/material";
import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";
import React, { HTMLInputTypeAttribute, useEffect, useMemo, useState } from "react";
import { Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from "@mui/material";
import EnhancedTableHead from "../table/EnhancedTableHead";
import TableOld from "../table/TableOld";
import { Order, getComparator, stableSort } from "@/utils/functions/sort";
import Link from "next/link";
import VerifiedIcon from '@mui/icons-material/Verified';
import NotInterestedIcon from '@mui/icons-material/NotInterested';


interface HeadCell1 {
    id: keyof IBCriteria;
    label: string;
    numeric: boolean; // to align
    disablePadding: boolean;
    width?: string;
}

interface HeadCell2 {
    id: keyof IBCriteriaSub;
    label: string;
    numeric: boolean; // to align
    disablePadding: boolean;
    width?: string;
}

const headCells: HeadCell1[] = [
    {
        id: "name",
        numeric: false,
        disablePadding: false,
        label: "Tên",
        width: "5%"
    },
];

const headCells2: HeadCell2[] = [
    {
        id: "name",
        numeric: false,
        disablePadding: false,
        label: "Tên ",
        width: "5%"
    },
    {
        id: "description",
        numeric: false,
        disablePadding: false,
        label: "Mô tả ",
        width: "5%"
    },

];

export default function FormAddCriteria() {
    const [criteriaList, setCriteriaList] = useState<IBCriteria[]>([]);
    const [criteria, setCriteria] = useState<IBCriteria>();
    const [criteriaSub, setCriteriaSub] = useState<IBCriteriaSub>();
    const [criteriaId, setCriteriaId] = useState<number>(1);
    const [criteriaSubId, setCriteriaSubId] = useState<number | undefined>();

    const [criteriaSubList, setCriteriaSubList] = useState<IBCriteriaSub[]>([]);
    const [cLick, setCLick] = useState<boolean>(false);
    const [status, setStatus] = useState<boolean | undefined>();
    const [order1, setOrder1] = useState<Order>('asc');
    const [order2, setOrder2] = useState<Order>('asc');
    const [orderBy, setOrderBy] = useState<keyof IBCriteria>('name');
    const [orderBy1, setOrderBy1] = useState<keyof IBCriteriaSub>('name');
    const [newCriteriaName, setNewCriteriaName] = useState('');
    const [newCriteriaSubName, setNewCriteriaSubName] = useState('');
    const [newCriteriaSubDescription, setNewCriteriaSubDescription] = useState('');


    const [criteriaName, setCriteriaName] = useState('');
    const [criteriaSubName, setCriteriaSubName] = useState('');
    const [criteriaSubDescription, setCriteriaSubDescription] = useState('');

    const openAlert = useAlert();
    const router = useRouter();
    const loading = useLoadingAnimation();

    useEffect(() => {
        fetchListCriteria();
    }, [])

    useEffect(() => {
        if (criteriaId != undefined || criteriaId != null) {
            fetchListCriteriaSub(criteriaId);
        }
        // fetchCriteriaDetail(criteriaId);
    }, [criteriaId])

    useEffect(() => {
        if (criteriaSubId != undefined || criteriaSubId != null) {
            fetchCriteriaSubDetail(criteriaSubId);
        }
    }, [criteriaSubId])

    async function fetchListCriteria() {
        try {
            // loading(true);
            const { data: response } = await getAllBCriteria();
            setCriteriaList(response);
            setStatus(response[0].status);
            // setCriteriaId(response[0].bCriteriaId);
            // console.log(response)
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

    async function fetchListCriteriaSub(criteriaId: number) {
        try {
            // loading(true);
            const { data: response } = await getAllBCriteriaSub(criteriaId);
            setCriteriaSubList(response);

            const { data: response1 } = await getCriteriaDetail(criteriaId);
            setCriteria(response1);
            setCriteriaName(response1?.name ?? "");
            setCLick(true);

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

    async function fetchCriteriaDetail(criteriaId: number) {
        try {
            // loading(true);
            const { data: response } = await getCriteriaDetail(criteriaId);
            setCriteria(response);
            // console.log(response)
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

    async function fetchCriteriaSubDetail(criteriaSubId: number | undefined) {
        if (criteriaSubId) {
            try {
                // loading(true);
                const { data: response } = await getCriteriaSubDetail(criteriaSubId);
                setCriteriaSub(response);
                setCriteriaSubName(response.name);
                setCriteriaSubDescription(response.description ?? "");
                // console.log(response)
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
    }

    const handleAddCriteria = async () => {
        if (newCriteriaName.trim() !== '') {
            try {
                loading(true);
                const { data: response } = await addCriteria(newCriteriaName);
                setCriteriaList([
                    ...criteriaList,
                    response
                ])
                setNewCriteriaName("");
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
                message: "Your types is error, checking again!",
            });
        }
    };

    const handleAddCriteriaSub = async () => {
        if (newCriteriaSubName.trim() !== '') {
            try {
                loading(true);
                const { data: response } = await addCriteriSub(criteriaId, newCriteriaSubName, newCriteriaSubDescription);
                setCriteriaSubList([
                    ...criteriaSubList,
                    response
                ])
                setNewCriteriaSubName("");
                setNewCriteriaSubDescription("");
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
                message: "Your types is error, checking again!",
            });
        }
    };

    const handleEdit = async () => {
        if (status) {
            if (cLick) {
                if (criteriaName.trim() !== '') {
                    try {
                        loading(true);
                        const { data: response } = await editCriteria(criteriaId, criteriaName, true);
                        const index = criteriaList.findIndex(c => c.bCriteriaId == criteriaId);
                        const newCriteriaList = [
                            ...criteriaList.slice(0, index),
                            response,
                            ...criteriaList.slice(index + 1)
                        ]

                        setCriteriaList(newCriteriaList);
                        openAlert({
                            severity: "success",
                            message: "Cập nhật thành công!"
                        });
                        // setCriteriaName("");
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
                        message: "Your types Name is empty, checking again!",
                    });
                }
            } else {
                if (criteriaSubName.trim() !== '') {
                    try {
                        loading(true);
                        const { data: response } = await editCriteriaSub(criteriaSubId ?? 0, criteriaSubName, criteriaSubDescription, true);
                        const index = criteriaSubList.findIndex(c => c.bCriteriaSubId == criteriaSubId);
                        const newCriteriaSubList = [
                            ...criteriaSubList.slice(0, index),
                            response,
                            ...criteriaSubList.slice(index + 1)
                        ]

                        setCriteriaSubList(newCriteriaSubList);
                        openAlert({
                            severity: "success",
                            message: "Cập nhật thành công!"
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
                } else {
                    openAlert({
                        severity: "error",
                        message: "Your types Name is empty, checking again!",
                    });
                }
            }

        }
    };

    const handleDelete = async () => {
        if (status) {
            if (cLick) {
                if (criteriaName.trim() !== '') {
                    try {
                        loading(true);
                        await deleteCriteria(criteriaId);
                        const newCriteriaList = [...criteriaList];
                        const index = criteriaList.findIndex(c => c.bCriteriaId == criteriaId);
                        newCriteriaList.splice(index, 1);
                        setCriteriaList(newCriteriaList);
                        setCriteriaName("");
                        setCriteriaId(criteriaList[0]?.bCriteriaId);
                        openAlert({
                            severity: "success",
                            message: "Xóa thành công!"
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
                } else {
                    openAlert({
                        severity: "error",
                        message: "Your types Name is empty, checking again!",
                    });
                }
            } else {
                if (criteriaSubName.trim() !== '') {
                    try {
                        loading(true);
                        await deleteCriteriaSub(criteriaSubId);
                        const newCriteriaSubList = [...criteriaSubList];
                        const index = criteriaSubList.findIndex(c => c.bCriteriaSubId == criteriaSubId);
                        newCriteriaSubList.splice(index, 1);
                        setCriteriaSubList(newCriteriaSubList);
                        setCriteriaSubId(criteriaSubList[0]?.bCriteriaSubId);
                        setCriteriaSubName("");
                        setCriteriaSubDescription("");
                        openAlert({
                            severity: "success",
                            message: "Xóa thành công!"
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
                } else {
                    openAlert({
                        severity: "error",
                        message: "Your types Name is empty, checking again!",
                    });
                }
            }

        }
    };

    const handleRequestSort = (
        event: React.MouseEvent<unknown>,
        property: keyof IBCriteria,
    ) => {
        const isAsc = orderBy === property && order1 === 'asc';
        setOrder1(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    }

    const handleRequestSort2 = (
        event: React.MouseEvent<unknown>,
        property: keyof IBCriteriaSub,
    ) => {
        const isAsc = orderBy1 === property && order2 === 'asc';
        setOrder2(isAsc ? 'desc' : 'asc');
        setOrderBy1(property);
    }

    return (
        <main className="flex flex-col gap-3 bg-white h-full">
            <div className=" flex rounded-lg overflow-auto bg-default p-4 gap-6 h-2/3">
                <div className="w-1/2 flex-col">
                    <Paper elevation={2} className="p-4 flex flex-col">
                        <h2 className="text-xl font-bold mb-4">Danh sách tiêu chí</h2>
                        <div className="flex justify-between w-full">
                            <TextField
                                label="Tên tiêu chí"
                                value={newCriteriaName}
                                onChange={(e) => setNewCriteriaName(e.target.value)}
                                className="mb-6 w-1/2"
                                size="small"
                            />
                            <Button variant="contained" color="primary"
                                // onClick={handleAddCriteria} 
                                className="bg-primary"
                                onClick={handleAddCriteria}
                            >
                                Thêm tiêu chí
                            </Button>
                        </div>
                        <TableContainer sx={{ maxHeight: 420 }}>
                            <Table stickyHeader aria-label="sticky table" className="h-full">
                                <EnhancedTableHead
                                    orderBy={orderBy}
                                    order={order1}
                                    onRequestSort={handleRequestSort}
                                    headCells={headCells}
                                />

                                <TableBody>
                                    {criteriaList.map((row, index) => {
                                        const labelId = `enhanced-table-checkbox-${index}`;

                                        return (
                                            <TableRow hover
                                                style={{ opacity: row.status ? 1 : 0.7 }}
                                            >
                                                <TableCell
                                                    component="th"
                                                    id={labelId}
                                                    scope="row"
                                                    onClick={() => {
                                                        setCriteriaId(row.bCriteriaId)
                                                        setCLick(true);
                                                        setCriteriaSubId(undefined);
                                                        row.status ? setStatus(true) : setStatus(false);
                                                        // console.log(row);
                                                    }}
                                                    className={`cursor-pointer ${criteriaId === row.bCriteriaId ? 'bg-blue-200' : 'hover:bg-gray-200'
                                                        } transition-colors duration-300 ease-in-out`}
                                                >
                                                    {row.name}
                                                    {/* <Link href={`behavior-scores/patterns/${row.bCriteriaId}`}>{row.name}</Link> */}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </div>
                <div className="w-1/2 flex-col h-full">
                    <Paper elevation={7} className="p-4 flex flex-col ">
                        <h2 className="text-xl font-bold mb-4">Danh sách tiêu chí con</h2>
                        <div className="flex w-full justify-between">
                            <div className="flex gap-2">
                                <TextField
                                    label="Tên tiêu chí con"
                                    value={newCriteriaSubName}
                                    onChange={(e) => setNewCriteriaSubName(e.target.value)}
                                    className="mb-6"
                                size="small"

                                />
                                <TextField
                                    label="Mô tả"
                                    value={newCriteriaSubDescription}
                                    onChange={(e) => setNewCriteriaSubDescription(e.target.value)}
                                    className="mb-6 ml-4"
                                size="small"

                                />
                            </div>
                            <Button variant="contained" color="primary"
                                // onClick={handleAddCriteria} 
                                className="bg-primary ml-auto mb-6"
                                onClick={handleAddCriteriaSub}
                            >
                                Thêm tiêu chí con
                            </Button>
                        </div>
                        <TableContainer sx={{ maxHeight: 420 }}>
                            <Table stickyHeader aria-label="sticky table" className="h-full">
                                <EnhancedTableHead
                                    orderBy={orderBy}
                                    order={order2}
                                    onRequestSort={handleRequestSort2}
                                    headCells={headCells2}
                                />

                                <TableBody>
                                    {criteriaSubList.map((row, index) => {
                                        const labelId = `enhanced-table--${index}`;

                                        return (
                                            <TableRow
                                                onClick={() => {
                                                    setCriteriaSubId(row.bCriteriaSubId)
                                                    setCLick(false);
                                                    row.status ? setStatus(true) : setStatus(false);
                                                    // console.log(row);
                                                }}
                                                className={`cursor-pointer ${criteriaSubId === row.bCriteriaSubId ? 'bg-green-100' : 'hover:bg-gray-200'
                                                    } transition-colors duration-300 ease-in-out`}
                                                style={{ opacity: row.status ? 1 : 0.7 }}
                                            >
                                                <TableCell
                                                    component="th"
                                                    id={labelId}
                                                    scope="row"

                                                >
                                                    {row.name}
                                                    {/* <Link href={`behavior-scores/patterns/${row.bCriteriaSubId}`}>{row.name}</Link> */}
                                                </TableCell>
                                                <TableCell align="left">{row.description}</TableCell>
                                                {/* <TableCell align="left">{row.dateOpen}</TableCell> */}
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </div>


            </div>
            <div className=" flex rounded-lg overflow-auto bg-slate-100 p-4">
                <Paper elevation={2} className="p-4 flex flex-col w-full ">
                    <div className="flex gap-3 ">
                        <Button variant="contained" color="primary" endIcon={<VerifiedIcon />}
                            className="mb-6 bg-yellow-500 hover:bg-yellow-600"
                            // onClick={handleAddCriteria} 
                            onClick={handleEdit}
                        >
                            Cập nhật
                        </Button>
                        <Button variant="contained" className="mb-6 bg-red-500 hover:bg-red-600" endIcon={<NotInterestedIcon />}
                            // onClick={handleAddCriteria} 
                            onClick={handleDelete}
                        >
                            Xóa
                        </Button>
                    </div>
                    {
                        cLick ? (
                            <TextField
                                label="Tên tiêu chí"
                                value={criteriaName}
                                onChange={(e) => setCriteriaName(e.target.value)}
                                className="mb-6 w-1/2 pr-3"
                                disabled={!status}
                                size="small"

                            />
                        ) : (
                            <div className="flex flex-col">
                                <TextField
                                    label="Tên tiêu chí con"
                                    value={criteriaSubName}
                                    onChange={(e) => setCriteriaSubName(e.target.value)}
                                    className="mb-6 w-1/2 pr-3"
                                    disabled={!status}
                                size="small"

                                />
                                <TextField
                                    label="Mô tả"
                                    value={criteriaSubDescription}
                                    onChange={(e) => setCriteriaSubDescription(e.target.value)}
                                    className="mb-6 w-1/2 pr-3"
                                    disabled={!status}
                                    size="small"

                                />
                            </div>
                        )
                    }
                </Paper>
            </div>
        </main>
    );
}
