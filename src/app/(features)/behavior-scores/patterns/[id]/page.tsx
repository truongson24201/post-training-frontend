'use client';

import { Button, Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { Order, getComparator, stableSort } from "@/utils/functions/sort";
import Link from "next/link";
import { IBehaviorCriteria, IBehaviorCriteriaSub, IBehaviorPattern, addBSPatternContent, checkPatternDisable, deletePattern, getBSPatternContent, getBSPatternContentDetails, getBehaviorPatterns, updateContentPattern } from "@/apis/BehaviorPatterns";
import useAlert from "@/hooks/useAlert";
import axios, { isAxiosError } from "axios";
import { useRouter } from "next/navigation";
import CreateIcon from '@mui/icons-material/Create';
import VerifiedIcon from '@mui/icons-material/Verified';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import EnhancedTableHead from "@/components/table/EnhancedTableHead";
import useLoadingAnimation from "@/hooks/useLoadingAnimation";
import InputAdornment from '@mui/material/InputAdornment';




interface IBPatternTable {
    ordinal: number;
    nameCriteria: string;
    // bCriteriaSubId: number;
    nameCriteriaSub: string;
    description: string;
    maxPoint: number,
}

interface HeadCell {
    id: keyof IBPatternTable;
    label: string;
    numeric: boolean; // to align
    disablePadding: boolean;
    width?: string;
}

const headCells: HeadCell[] = [
    {
        id: "nameCriteriaSub",
        numeric: false,
        disablePadding: false,
        label: "Nội dung",
        width: "40%"
    },
    {
        id: "description",
        numeric: false,
        disablePadding: false,
        label: "Mô tả",
        width: "50%"
    },
    {
        id: "maxPoint",
        numeric: true,
        disablePadding: false,
        label: "Điểm tối đa",
        width: "10%"
    },
];


export default function Page({
    params,
}: {
    params: { id: number }
}) {
    const loading = useLoadingAnimation();

    const [inputValues, setInputValues] = useState<{ [key: number]: number }>({});
    const [total, setTotal] = useState<number>(0);
    const [BPatternContent, setBPatternContent] = useState<IBehaviorCriteria[]>([]);
    const [isDisable, setDisable] = useState<boolean>(false);

    const openAlert = useAlert();
    const router = useRouter();

    console.log(params.id,"bSPatternId")

    useEffect(() => {
        fetchBPatternContent(params.id);
    }, []);

    // console.log(inputValues,"inputValues")
    // console.log(selected,"selected")


    async function fetchBPatternContent(id:number) {
        try {
            loading(false);
            const { data: response } = await getBSPatternContentDetails(id);
            setBPatternContent(response);
            const {data : check} = await checkPatternDisable(id);
            setDisable(check);
            const updatedInputValues: { [key: number]: number } = {};
            response.forEach((item: IBehaviorCriteria) => {
                item.bCriteriaSubs.forEach((subItem: IBehaviorCriteriaSub) => {
                    updatedInputValues[subItem.bCriteriaSubId] = subItem.maxPoint;
                });
            });
            const newSelected = response.flatMap(n => n.bCriteriaSubs.map((m) => m.bCriteriaSubId));
            setInputValues(updatedInputValues);
            const keys = Object.keys(updatedInputValues);
            const valueArr = keys.map(key => updatedInputValues[Number(key)]);
            const summ = valueArr.reduce((sum, entry) => {
                return sum + entry;
            }, 0);
            setTotal(summ);
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


    const handleDelete = async () => {
        try {
            loading(true);
            const { data: response } = await deletePattern(params.id);
            openAlert({
                severity: "success",
                message: response
            });
            router.push("/behavior-scores/patterns")
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
    };


    return (
        <main className="h-full w-full flex flex-col rounded-lg overflow-hidden bg-default">
            {/* <EnhancedTableToolbar numSelected={selected.length} comboxSearch={false} actionHandler={handleSaveClick}/> */}
            <div className="h-16 px-3 flex justify-end items-center">
                <div className="flex gap-3 m-8 ">
                    <Button variant="contained" className="bg-red-500 hover:bg-red-600" endIcon={<NotInterestedIcon />}
                        disabled={!isDisable}
                        onClick={handleDelete}
                    >
                        Xóa
                    </Button>
                    <Button variant="contained" className="bg-primary" endIcon={<VerifiedIcon />}
                        disabled={!isDisable}
                        // onClick={handleUpdate}
                        onClick={() => router.push(`/behavior-scores/patterns/edit/${params.id}`)}
                        
                    >
                        Cập nhật
                    </Button>
                </div>
            </div>
            <TableContainer sx={{ maxHeight: 620 }} className="bg-slate-100 p-4">
                <Table stickyHeader aria-label="sticky table" className="h-full">
                    <EnhancedTableHead
                        // numSelected={selected.length}
                        // rowCount={BPatternContentAll.length}
                        // onSelectAllClick={handleSelectAllClick}
                        // isAllSelected={isAllSelected}
                        // orderBy={orderBy}
                        // order={order}
                        // onRequestSort={handleRequestSort}
                        headCells={headCells}
                    />

                    <TableBody className="bg-gray-50">
                        {BPatternContent.map((row, index) => {
                            const labelId = `enhanced-table-checkbox-${index}`;

                            return (
                                <>
                                    <TableRow>
                                        <TableCell colSpan={headCells.length + 1} className="bg-green-200" align="left">Tiêu chí: {row.name}</TableCell>
                                    </TableRow>
                                    {row.bCriteriaSubs.map((rowsub, index) => {

                                        return (
                                            <>
                                                <TableRow hover
                                                    key={rowsub.bCriteriaSubId}
                                                    className="h-20"
                                                >
                                                    <TableCell align="left" >{rowsub.name}</TableCell>
                                                    <TableCell align="left">{rowsub.description}</TableCell>
                                                    <TableCell align="left" className="">
                                                        <TextField
                                                            // label="Điểm tối đa"
                                                            // value=
                                                            disabled={true}
                                                            type="text"
                                                            size="small"
                                                            InputProps={{
                                                                endAdornment: <InputAdornment position="end">{inputValues[rowsub.bCriteriaSubId] || ''}</InputAdornment>,
                                                            }}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            </>
                                        )
                                    })}
                                </>
                            )
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
            <div className=" ml-auto bg-primary p-4 mr-12 my-4 w-32 h-12 hover:hidden text-white items-center flex font-bold rounded-lg justify-between"
            >
                Tổng: <span>{total}</span>
            </div>
        </main>
    )
}
