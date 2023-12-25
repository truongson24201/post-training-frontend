'use client';
import { Checkbox, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { Order, getComparator, stableSort } from "@/utils/functions/sort";
import Link from "next/link";
import EnhancedTableToolbar from "../table/EnhancedTableToolbar";
import EnhancedTableHead from "../table/EnhancedTableHead";
import useLoadingAnimation from "@/hooks/useLoadingAnimation";
import { IBehaviorPattern, getBehaviorPatterns, openPattern } from "@/apis/BehaviorPatterns";
import useAlert from "@/hooks/useAlert";
import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";
import ViewStatus from "@/components/ViewStatus";
import { ISemester, getCurrentSemester } from "@/apis/Common";


interface HeadCell {
    id: keyof IBehaviorPattern;
    label: string;
    numeric: boolean; // to align
    disablePadding: boolean;
    width?: string;
}

const headCells: HeadCell[] = [
    // {
    //     id: "ordinal",
    //     numeric: true,
    //     disablePadding: false,
    //     label: "Ordinal Number",
    //     width: "10%"
    // },
    {
        id: "bSPatternId",
        numeric: true,
        disablePadding: false,
        label: "Id",
        width: "5%"
    },
    {
        id: "updateOn",
        numeric: false,
        disablePadding: false,
        label: "Ngày cập nhật",
        width: "15%"
    },
    {
        id: "updateBy",
        numeric: false,
        disablePadding: false,
        label: "Người cập nhật",
        width: "30%"
    },
    {
        id: "dateOpen",
        numeric: false,
        disablePadding: false,
        label: "Ngày mở",
        width: "15%"
    },
    {
        id: "dateClose",
        numeric: false,
        disablePadding: false,
        label: "Ngày đóng",
        width: "15%"
    },
    {
        id: "status",
        numeric: false,
        disablePadding: false,
        label: "Trạng thái",
        width: "10%"
    },
];


export default function BehaviorPatternTable() {
    const loading = useLoadingAnimation();
    const [order, setOrder] = useState<Order>('asc');
    const [orderBy, setOrderBy] = useState<keyof IBehaviorPattern>('bSPatternId');
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(15);
    const [behaviorPatterns, setBehaviotPatterns] = useState<IBehaviorPattern[]>([]);
    const openAlert = useAlert();
    const router = useRouter();
    const [checked, setChecked] = React.useState(false);

    const [semester, setSemester] = useState<ISemester>();



    useEffect(() => {
        fetchBehaviorPatterns();
    }, [checked]);

    useEffect(() => {
        fetchCurrentSemester();
    }, []);

    async function fetchCurrentSemester() {
        try {
            // loading(true);
            const { data: response } = await getCurrentSemester();
            setSemester(response);
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
            // loading(false);
        }
    }

    async function fetchBehaviorPatterns() {
        try {
            // loading(true);
            const { data: response } = await getBehaviorPatterns();
            setBehaviotPatterns(response);

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
            // loading(false);
        }
    }

    const handleChangeChecked = async (event: React.ChangeEvent<HTMLInputElement>, bSPatternId: number) => {
        try {
            loading(true);
            const { data: response } = await openPattern(bSPatternId);
            openAlert({
                severity: "success",
                message: response
            });
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

    const handleRequestSort = (
        event: React.MouseEvent<unknown>,
        property: keyof IBehaviorPattern,
    ) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    }
    // HEAD HEAD HEAD HEAD HEAD



    // BODY BODY BODY BODY BODY
    const visibleRows = useMemo(
        () =>
            stableSort(behaviorPatterns, getComparator(order, orderBy)).slice(
                page * rowsPerPage,
                page * rowsPerPage + rowsPerPage,
            ),
        [order, orderBy, page, rowsPerPage, behaviorPatterns],
    );


    // FOOT FOOT FOOT FOOT FOOT
    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
    // FOOT FOOT FOOT FOOT FOOT

    return (
        <main className="h-full flex flex-col rounded-lg overflow-hidden bg-default">
            <div className="flex justify-between">
                {semester && <p className="bg-green-100 p-2 mb-4 rounded-lg ml-3">Học kỳ {semester?.num} năm {semester?.year}-{semester?.year -1 + 2}</p>}
                <EnhancedTableToolbar
                    comboxSearch={false}
                    actionHandler={() => {
                        loading(true);
                        router.push("patterns/add");
                    }}
                />
            </div>
            <TableContainer sx={{ maxHeight: 520 }}>
                <Table stickyHeader aria-label="sticky table" className="h-full">
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
                                <TableRow hover
                                    onClick={() => {
                                        loading(true);
                                        router.push(`./patterns/${row.bSPatternId}`);
                                    }}
                                >
                                    {/* <TableCell  align="left">{row.ordinal}</TableCell> */}
                                    <TableCell component="th" id={labelId} scope="row" align="right">{row.bSPatternId}</TableCell>
                                    <TableCell align="left">{row.updateOn}</TableCell>
                                    <TableCell align="left">{row.updateBy}</TableCell>
                                    <TableCell align="left">{row.dateOpen}</TableCell>
                                    <TableCell align="left">{row.dateClose}</TableCell>
                                    <TableCell align="left">
                                        <div className="" onClick={(event) => event.stopPropagation()}>
                                            <Switch
                                                checked={row.status == true}
                                                onChange={(event) => handleChangeChecked(event, row.bSPatternId)}
                                                inputProps={{ 'aria-label': 'controlled' }}
                                            />
                                        </div>
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
                count={behaviorPatterns.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </main>
    )
}
