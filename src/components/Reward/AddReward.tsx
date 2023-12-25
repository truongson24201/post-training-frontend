'use client'

import { Table, TableBody, TableCell, TableContainer, TablePagination, TableRow, } from "@mui/material";
import React, { useState, useEffect, useMemo } from "react";
import useAlert from "@/hooks/useAlert";
import useLoadingAnimation from "@/hooks/useLoadingAnimation";
import { isAxiosError } from "axios";
import { FormControl, InputLabel, MenuItem, Select, Tooltip, TextField, Autocomplete, Button, SelectChangeEvent } from "@mui/material";
import { ComPointView, ITableScoreStudent, SubjectPointView, getScoreOfStudent } from "@/apis/Scores";
import { useRouter } from "next/navigation";
import EnhancedTableHead from "@/components/table/EnhancedTableHead";
import DoneIcon from '@mui/icons-material/Done';
import usePopup from "@/hooks/usePopup";
import VerifiedIcon from '@mui/icons-material/Verified';
import { IFaculty, ISemester, getAllFaculty, getAllSemester, getSemesterToPermission } from "@/apis/Common";
import { AddReward, IReward, addRewardsStudents, checkHasReward, previewRewardsStudents, updateRewardsStudents } from "@/apis/reward";
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import PreviewIcon from '@mui/icons-material/Preview';
import Popup from "@/hooks/Popup";

interface IRewardTable {
    studentId: string,
    fullname: string,
    className: string,
    email: number,
    DOB: string,
    phone: string,
    gpaFound: number,
    gpaTen: number,
    gpaBehavior: number,
    content: string,
}

interface HeadCell {
    id: keyof IRewardTable;
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
        id: "fullname",
        numeric: false,
        disablePadding: false,
        label: "Họ tên",
        width: "25%"
    },
    {
        id: "className",
        numeric: false,
        disablePadding: false,
        label: "Lớp",
        width: "10%"
    },
    {
        id: "email",
        numeric: false,
        disablePadding: false,
        label: "email",
        width: "10%"
    },
    {
        id: "gpaFound",
        numeric: true,
        disablePadding: false,
        label: "Điểm hệ 4",
        width: "11%"
    },
    {
        id: "gpaBehavior",
        numeric: true,
        disablePadding: false,
        label: "Điểm rèn luyện",
        width: "11%"
    },
    {
        id: "content",
        numeric: false,
        disablePadding: false,
        label: "Loại",
        width: "6%"
    },
];

export default function AddReward() {
    const loading = useLoadingAnimation();
    const openAlert = useAlert();
    const router = useRouter();
    const popup = usePopup();

    const [facultyId, setFacultyId] = useState<string>('');
    const [faculties, setfaculties] = useState<IFaculty[]>([]);
    const [semesters, setSemesters] = useState<ISemester[]>([]);
    const [semesterId, setSemesterId] = useState<string>('');

    const [hasReward, setHasReward] = useState<boolean>(false);

    const [scoreMin, setScoreMin] = useState<string>('');
    const [behaviorMin, setBehaviorMin] = useState<string>('');
    const [amount, setAmount] = useState<string>('');

    const [rewards, setRewards] = useState<IReward[]>([]);

    useEffect(() => {
        fetchDataCombobox();
    }, [])

    // useEffect(() => {
    //     fetchRewards();
    // }, [facultyId, semesterId])

    async function fetchDataCombobox() {
        try {
            const { data: response } = await getAllFaculty();
            setfaculties(response);
            const { data: res } = await getSemesterToPermission();
            setSemesters(res);
        }
        catch (ex) {

        }
    }

    const handlePostReward = async () => {
        if (rewards.length != 0) {
            try {
                const addRewardsList: AddReward[] = rewards.map((reward: IReward) => {
                    return {
                        studentId: reward.student.studentId,
                        gpaFound: reward.gpaReward.totalFourPoint,
                        gpaBehavior: reward.gpaReward.totalBehaviorPoint,
                        content: reward.gpaReward.content
                    };
                });
                const { data: response } = await addRewardsStudents(Number.parseInt(semesterId), addRewardsList);
                openAlert({
                    severity: "success",
                    message: response
                });
                const { data: res } = await checkHasReward(Number.parseInt(facultyId), Number.parseInt(semesterId));
                setHasReward(true);
            }
            catch (error) {
                if (isAxiosError(error)) {
                    openAlert({
                        severity: "error",
                        message: error.response?.data
                    });
                }
            } finally {
                loading(false);
            }
        }else {
            openAlert({
                severity: "error",
                message: "Hãy Xem trước danh sách học bổng"
            });
        }

    }

    const handlePutReward = async () => {
        if (rewards.length != 0) {
            try {
                const addRewardsList: AddReward[] = rewards.map((reward: IReward) => {
                    return {
                        studentId: reward.student.studentId,
                        gpaFound: reward.gpaReward.totalFourPoint,
                        gpaBehavior: reward.gpaReward.totalBehaviorPoint,
                        content: reward.gpaReward.content
                    };
                });
                const { data: response } = await updateRewardsStudents(Number.parseInt(facultyId),Number.parseInt(semesterId), addRewardsList);
                openAlert({
                    severity: "success",
                    message: response
                });
                const { data: res } = await checkHasReward(Number.parseInt(facultyId), Number.parseInt(semesterId));
                setHasReward(true);
            }
            catch (error) {
                if (isAxiosError(error)) {
                    openAlert({
                        severity: "error",
                        message: error.response?.data
                    });
                }
            } finally {
                loading(false);
            }
        }else {
            openAlert({
                severity: "error",
                message: "Hãy Xem trước danh sách học bổng"
            });
        }

    }

    const completedRequest =
        <Popup text="Học kỳ và khoa này đã được được xét học bổng, Bạn có chắc chắn muốn cập nhật danh sách không?">
            <Button className="bg-primary m-10 " variant="contained"
                onClick={() => {
                    popup.hide();
                    handlePutReward();
                }}
            >
                Cập nhật
            </Button>
            <Button className="bg-primary m-10 " variant="contained"
                onClick={() => {
                    popup.hide();

                }}
            >
                Hủy
            </Button>
        </Popup>;


    const handlePreview = async () => {
        if (facultyId != '' && semesterId != '' && scoreMin != '' && behaviorMin != '' ) {
            try {
                loading(true);
                const { data: response } = await previewRewardsStudents(
                    Number.parseInt(facultyId),
                    Number.parseInt(semesterId),
                    Number.parseFloat(scoreMin),
                    Number.parseInt(behaviorMin),
                    Number.parseInt(amount)
                );
                setRewards(response);
                
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
                message: "Vui lòng nhập đầy đủ và đúng dữ liệu!"
            });
        }
    }

    

    useEffect(() =>{
        fetchHasReward();
    },[facultyId,semesterId])

    async function fetchHasReward() {
        try {
            const { data: res } = await checkHasReward(Number.parseInt(facultyId), Number.parseInt(semesterId));
            setHasReward(res);
            setRewards([]);
        }
        catch (ex) {

        }
    }

    return (
        <>
            <div className="w-full h-full flex flex-col rounded-xl ">
                <div className="rounded-b-lg overflow-auto p-2 shadow-lg m-2">
                    <div className="flex gap-5 items-center mb-3">
                        <FormControl required sx={{ minWidth: 220 }}>
                            <InputLabel size="small" id="select-semester">Học kỳ</InputLabel>
                            <Select
                                labelId="select-semester"
                                id="semesters"
                                value={semesterId}
                                label="Học kỳ*"
                                size="small"
                                onChange={(evet: SelectChangeEvent) => {
                                    setSemesterId(evet.target.value);
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
                        <FormControl required sx={{ minWidth: 200 }}>
                            <InputLabel size="small" id="demo-simple-select-label">Khoa</InputLabel>
                            <Select
                                size="small"
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={facultyId}
                                label="Khoa*"
                                onChange={(event: SelectChangeEvent) => {
                                    setFacultyId(event.target.value);
                                }}
                            >
                                <MenuItem value="">
                                    <em>None</em>
                                </MenuItem>
                                {faculties.map(d => (
                                    <MenuItem value={d.facultyId}>{d.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            placeholder="Lớn hơn hoặc bằng"
                            size="small"
                            label="Điểm hệ 4"
                            value={scoreMin}
                            onChange={(e) => {
                                const valueIn = Number.parseInt(e.target.value);
                                if (valueIn >= 0 && valueIn <= 4 || Number.isNaN(valueIn))
                                    setScoreMin(e.target.value)
                            }}
                            className=" w-44 "
                            type="number"
                            error={scoreMin == ""}
                        />
                        <TextField
                            placeholder="Lớn hơn hoặc bằng"
                            size="small"
                            label="Điểm rèn luyện"
                            value={behaviorMin}
                            onChange={(e) => {
                                const valueIn = Number.parseInt(e.target.value);
                                if (valueIn >= 0 && valueIn <= 200 || Number.isNaN(valueIn))
                                    setBehaviorMin(e.target.value)
                            }}
                            className=" w-44 "
                            type="number"
                            error={behaviorMin == ""}
                        />
                        {/* <TextField
                            size="small"
                            label="Số lượng"
                            value={amount}
                            onChange={(e) => {
                                const valueIn = Number.parseInt(e.target.value);
                                if (valueIn >= 1 || Number.isNaN(valueIn))
                                    setAmount(e.target.value)
                            }}
                            className="w-44 "
                            type="number"
                            error={amount == ""}
                        /> */}
                        <Button variant="contained" color="primary"
                            // onClick={handleAddCriteria} 
                            className="bg-primary mr-auto "
                            onClick={handlePreview}
                            endIcon={<PreviewIcon />}
                        >
                            View
                        </Button>
                        <Button variant="contained" color="primary"
                            // onClick={handleAddCriteria} 
                            className="bg-primary ml-auto "
                            onClick={() => {
                                hasReward ? popup.show(completedRequest) : handlePostReward();
                            }}
                            endIcon={<SaveAltIcon />}
                        >
                            Lưu
                        </Button>
                    </div>
                    <TableContainer sx={{ maxHeight: 500 }}>
                        <Table stickyHeader aria-label="sticky table" >
                            <EnhancedTableHead
                                headCells={headCells}
                            />
                            <TableBody>
                                {rewards.map((row, index) => {
                                    const labelId = `enhanced-table-checkbox-${index}`;

                                    return (
                                        <TableRow hover key={row.student.studentId}>
                                            <TableCell
                                                component="th"
                                                id={labelId}
                                                scope="row"
                                                align="left"
                                            >
                                                {row.student.studentId}

                                            </TableCell>
                                            <TableCell align="left">{row.student.profile.fullname}</TableCell>
                                            <TableCell align="left">{row.student.aClass.className}</TableCell>
                                            <TableCell align="left">{row.student.profile.email}</TableCell>
                                            <TableCell align="right">{row.gpaReward.totalFourPoint.toFixed(2)}</TableCell>
                                            <TableCell align="right">{row.gpaReward.totalBehaviorPoint}</TableCell>
                                            <TableCell align="left">{row.gpaReward.content}</TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 15]}
                        component="div"
                        count={rewards.length}
                        rowsPerPage={0}
                        page={0}
                        onPageChange={() =>{}}
                        onRowsPerPageChange={()=>{}}
                    />

                </div>
            </div>
        </>
    )
}
