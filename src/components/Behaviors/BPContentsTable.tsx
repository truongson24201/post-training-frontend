'use client';
import { Button, Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { Order, getComparator, stableSort } from "@/utils/functions/sort";
import Link from "next/link";
import EnhancedTableToolbar from "../table/EnhancedTableToolbar";
import EnhancedTableHead from "../table/EnhancedTableHead";
import useLoadingAnimation, { LoadingAnimationProvider } from "@/hooks/useLoadingAnimation";
import { IBehaviorCriteria, IBehaviorCriteriaSub, IBehaviorPattern, addBSPatternContent, getBSPatternContent, getBehaviorPatterns } from "@/apis/BehaviorPatterns";
import useAlert from "@/hooks/useAlert";
import axios, { isAxiosError } from "axios";
import { useRouter } from "next/navigation";
import CreateIcon from '@mui/icons-material/Create';


export interface IBPatternTable {
    ordinal: number;
    nameCriteria: string;
    // bCriteriaSubId: number;
    nameCriteriaSub: string;
    description: string;
    maxPoint: number,
}

interface IBPatternAdd {
    bCriteriaSubId: number;
    maxPoint: number;
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
        disablePadding: true,
        label: "(All) Nội dung tiêu chí",
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


export default function BPContentsTable() {
    const loading = useLoadingAnimation();

    const [selected, setSelected] = React.useState<readonly number[]>([]);
    const [isAllSelected, setIsAllSelected] = useState(false);
    const [inputValues, setInputValues] = useState<{ [key: number]: number }>({});
    const [total, setTotal] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = React.useState(0);
    const [BPatternContent, setBPatternContent] = useState<IBehaviorCriteria[]>([]);
    const openAlert = useAlert();
    const router = useRouter();



    useEffect(() => {
        fetchBPatternContent();
    }, []);

    console.log(inputValues,"inputValues")


    async function fetchBPatternContent() {
        try {
            loading(false);
            const { data: response } = await getBSPatternContent();
            setBPatternContent(response);
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

    const handleSelectAllClick = () => {
        if (isAllSelected) {
            setSelected([]);
            const updatedInputValues = { };
            setInputValues(updatedInputValues);
            setTotal(0);
        
        } else {
            const newSelected = BPatternContent.flatMap(n => n.bCriteriaSubs.map((m) => m.bCriteriaSubId));
            setSelected(newSelected);
        }
        setIsAllSelected(!isAllSelected);
    };

    const isSelected = (id: number) => selected.indexOf(id) !== -1;

    const handleClick = (event: React.MouseEvent<unknown>, id: number) => {
        const selectedIndex = selected.indexOf(id);
        let newSelected: readonly number[] = [];
       
        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
            
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1),
            );
        }

        setSelected(newSelected);
        const updatedInputValues = { ...inputValues };
        delete updatedInputValues[id];
        setInputValues(updatedInputValues);
        const keys = Object.keys(updatedInputValues);
        const valueArr = keys.map(key => updatedInputValues[Number(key)]);
        const summ = valueArr.reduce((sum, entry) => {
            return sum + entry;
        }, 0);
        setTotal(summ);
        setIsAllSelected(newSelected.length === BPatternContent.length);
    };


    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>, bCriteriaSubId: number) => {
        const inputValue = Number(event.target.value);

        if (!isNaN(inputValue) && inputValue >= 0 && inputValue <= 100) {
            const tmp = {
                ...inputValues,
                [bCriteriaSubId]: inputValue,
            }
            setInputValues(tmp);
            
            
            const keys = Object.keys(tmp);
            const valueArr = keys.map(key => tmp[Number(key)]);

            const summ = valueArr.reduce((sum, entry) => {
                return sum + entry;
            }, 0);
            setTotal(summ);

        } 
    };

    const handleSaveClick = async () => {
        // Gom dữ liệu thành mảng dạng đã mô tả
        const dataArray = selected.map((bCriteriaSubId) => ({
            maxPoint: inputValues[bCriteriaSubId] || undefined,
            bCriteriaSubId,
        }));
        const valuesArray = Object.values(inputValues);
        if (selected.length == 0) {
            openAlert({
                severity: "error",
                message: "Vui lòng chọn ít nhất 1 tiêu chí!"
            });
        } else {
            if (!dataArray.some(value => value.maxPoint === undefined)){
                try {
                    loading(true);
                    const {data: response} = await addBSPatternContent(dataArray);
                    openAlert({
                        severity: "success",
                        message: response
                    });
                    router.push("./");
                } catch (error) {
                    if (isAxiosError(error)) {
                        openAlert({
                            severity: "error",
                            message: error.response?.data
                        });
                    }
                }finally {
                    loading(false);
                }
            }else {
                openAlert({
                    severity: "error",
                    message: "Hãy nhập điểm tối đa cho các tiêu chí đã chọn!"
                });
            }
        }
    };

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        const charCode = event.charCode;

        // Kiểm tra xem ký tự vừa được nhập có phải là số hay không
        if (charCode < 48 || charCode > 57) {
            event.preventDefault();
        }
    };

    return (
        <main className="h-full flex flex-col rounded-lg overflow-hidden bg-default">
            {/* <EnhancedTableToolbar numSelected={selected.length} comboxSearch={false} actionHandler={handleSaveClick}/> */}
            <div className="h-16 px-3 flex justify-between items-center">
                <div className="w-full">

                </div>

                <div className="flex gap-3 m-8">
                    <Button className="bg-primary" variant="contained" endIcon={<CreateIcon />}
                        onClick={handleSaveClick}
                    >
                        Tạo
                    </Button>
                </div>
            </div>
            <TableContainer sx={{ maxHeight: 520 }} className="bg-slate-100 p-4">
                <Table stickyHeader aria-label="sticky table" className="h-full">
                    <EnhancedTableHead
                        numSelected={selected.length}
                        rowCount={BPatternContent.length}
                        onSelectAllClick={handleSelectAllClick}
                        isAllSelected={isAllSelected}
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
                                        const isItemSelected = isSelected(rowsub.bCriteriaSubId);

                                        return (
                                            <>
                                                <TableRow hover
                                                    key={rowsub.bCriteriaSubId}
                                                    selected={isItemSelected}
                                                    style={{ opacity: isItemSelected ? 1 : 0.7 }}
                                                    className="h-20"
                                                >
                                                    <TableCell padding="checkbox" align="left">
                                                        <Checkbox
                                                            color="primary"
                                                            checked={isItemSelected}
                                                            onClick={(event) => handleClick(event, rowsub.bCriteriaSubId)}
                                                            inputProps={{
                                                                'aria-labelledby': labelId,
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell component="th" scope="row" align="left" padding="none">{rowsub.name}</TableCell>
                                                    <TableCell align="left">{rowsub.description}</TableCell>
                                                    <TableCell align="left">
                                                        {selected.includes(rowsub.bCriteriaSubId) ? (
                                                            <TextField
                                                                label="Điểm tối đa"
                                                                value={inputValues[rowsub.bCriteriaSubId] || ''}
                                                                onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleInputChange(event, rowsub.bCriteriaSubId)}
                                                                type="number"
                                                                size="small"
                                                                // onKeyPress={handleKeyPress}
                                                            />
                                                        ) : (
                                                            rowsub.maxPoint
                                                        )}
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
            <div className=" ml-auto bg-primary p-4 mr-14 my-4 w-36 h-12 hover:hidden text-white items-center flex font-bold rounded-lg justify-between"
            >
                Tổng: <span>{total}</span>
            </div>
        </main>
    )
}
