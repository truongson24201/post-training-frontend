'use client';

import useAlert from "@/hooks/useAlert";
import { useState, useEffect } from "react";
import { Button, SelectChangeEvent, Step, StepLabel, Stepper, Typography, TextField } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { ISemester, getCurrentSemester } from "@/apis/Common";
import useLoadingAnimation from "@/hooks/useLoadingAnimation";
import { isAxiosError } from "axios";
import loginImgSrc from "@/features/login/assets/login_02.png";
import CreateIcon from '@mui/icons-material/Create';
import { IExamPlan, addExamPlan, deleteExamPlan, getExamPlanDetails, updateExamPlan } from "@/apis/ExamPlan";
import { useRouter } from "next/navigation";
import Image from "next/image";
import VerifiedIcon from '@mui/icons-material/Verified';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import BackwardButton from "@/components/BackwardButton";

export default function Page({
    params,
}: {
    params: { id: number }
}) {

    const [title, setTitle] = useState("");
    const [dateStart, setDateStart] = useState<Dayjs | null>(null);
    const [dateEnd, setDateEnd] = useState<Dayjs | null>(null);

    const [examPlan, setExamPlan] = useState<IExamPlan>();
    const loading = useLoadingAnimation();
    const openAlert = useAlert();
    const router = useRouter();

    useEffect(() => {
        fetchExamPlanDetails(params.id);
    }, [])

    async function fetchExamPlanDetails(id: number) {
        try {
            loading(true);
            const { data: examplan } = await getExamPlanDetails(id);
            setExamPlan(examplan);
            setTitle(examplan.title);
            setDateStart(dayjs(examplan.dateStart, "DD/MM/YYYY"));
            setDateEnd(dayjs(examplan.dateEnd, "DD/MM/YYYY"));
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

    const handleSaveClick = async () => {
        try {
            loading(true);
            if (dateStart && dateStart?.isBefore(dateEnd)){
                const { data: response } = await updateExamPlan(params.id,dateStart?.format("DD/MM/YYYY") ?? "", dateEnd?.format("DD/MM/YYYY") ?? "", title);
                openAlert({
                    severity: "success",
                    message: response
                });
            }else {
                openAlert({
                    severity: "error",
                    message: "Ngày kết thúc dự kiến phải lớn hơn ngày băt đầu",
                });
            }
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
    }

    const handleDeleteClick = async () => {
        try {
            loading(true);
            const { data: response } = await deleteExamPlan(params.id);
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
        } finally {
            loading(false);
        }
    }

    return (
        <div className="w-full h-screen flex flex-col overflow-hidden">
            <main className="min-h-full w-full px-4 py-2 flex flex-col bg-neutral-100">
                <BackwardButton />
                <main className="flex">
                    <div className="flex-shrink-0 p-8 w-1/2 flex flex-col gap-8 rounded-md shadow-sm border bg-white">
                        <TextField
                            fullWidth
                            id="semester"
                            label="Học kỳ"
                            variant="outlined"
                            value={"Học kỳ " + examPlan?.semester.num + ", năm " + examPlan?.semester?.year}
                            disabled={true}

                        />
                        <TextField
                            fullWidth
                            id="title"
                            label="Tiêu đề"
                            variant="outlined"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <DatePicker
                            className="w-full"
                            label="Ngày bắt đầu"
                            value={dateStart}
                            minDate={dayjs(new Date())}
                            maxDate={dayjs(examPlan?.semester?.dateEnd, "DD/MM/YYYY")}
                            format="DD/MM/YYYY"
                            onChange={(newDate: Dayjs | null) => { setDateStart(newDate) }}
                        />
                        <DatePicker
                            className="w-full"
                            label="Ngày kết thúc dự kiến"
                            value={dateEnd}
                            minDate={dayjs(dateStart).add(1, "day")}
                            maxDate={dayjs(examPlan?.semester?.dateEnd, "DD/MM/YYYY")}
                            format="DD/MM/YYYY"
                            onChange={(newDate: Dayjs | null) => { setDateEnd(newDate) }}
                        />
                        <div className="flex gap-3 ">
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
                    </div>
                    <div className="relative w-1/2">
                        <Image
                            className="object-contain"
                            src={loginImgSrc}
                            alt=""
                            fill
                        />
                    </div>
                </main>
            </main>
        </div>
    )

}