'use client';

import useAlert from "@/hooks/useAlert";
import { useState, useEffect } from "react";
import { Button, SelectChangeEvent, Step, StepLabel, Stepper, Typography, TextField } from "@mui/material";
import { CustomTabPanel } from "../TabPanel";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { ISemester, getCurrentSemester } from "@/apis/Common";
import useLoadingAnimation from "@/hooks/useLoadingAnimation";
import { isAxiosError } from "axios";
import Logo from "../Logo";
import Image from "next/image";
import loginImgSrc from "@/features/login/assets/login_02.png";
import CreateIcon from '@mui/icons-material/Create';
import { addExamPlan } from "@/apis/ExamPlan";
import { useRouter } from "next/navigation";
import BackwardButton from "../BackwardButton";

export default function ExamPlanFormAdd() {

    const [title, setTitle] = useState("");
    // const [regisOpening, setRegisOpening] = useState<Dayjs | null>(null);
    // const [regisClosing, setRegisClosing] = useState<Dayjs | null>(null);
    const [dateStart, setDateStart] = useState<Dayjs | null>(null);
    const [dateEnd, setDateEnd] = useState<Dayjs | null>(null);

    // const [activeStep, setActiveStep] = useState(0);
    const setAlert = useAlert();
    const [semester, setSemester] = useState<ISemester>();
    const loading = useLoadingAnimation();
    const openAlert = useAlert();
    const router = useRouter();

    useEffect(() => {
        fetchCurrentSemester();
    }, [])

    async function fetchCurrentSemester() {
        try {
            loading(true);
            const { data: semester } = await getCurrentSemester();
            setSemester(semester);
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
                const { data: response } = await addExamPlan(dateStart?.format("DD/MM/YYYY")?? "",dateEnd?.format("DD/MM/YYYY")?? "",title);
                openAlert({
                    severity: "success",
                    message: response
                });
                router.push("./");
            }else {
                openAlert({
                    severity: "error",
                    message: "Ngày kết thúc dự kiến phải lớn hơn ngày băt đầu",
                });
            }
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
                            value={"Học kỳ " + semester?.num + ", năm " + semester?.year}
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
                        {/* <DatePicker
                            className="w-full"
                            label="Opening Resigter"
                            value={regisOpening}
                            minDate={dayjs(new Date())}
                            maxDate={dayjs(semester?.dateEnd,"DD/MM/YYYY")}
                            format="DD/MM/YYYY"
                            onChange={(newDate: Dayjs | null) => { setRegisOpening(newDate) }}
                        />
                        <DatePicker
                            className="w-full"
                            label="Closing Register"
                            value={regisClosing}
                            minDate={dayjs(regisOpening).add(1, "day")}
                            maxDate={dayjs(semester?.dateEnd,"DD/MM/YYYY")}
                            format="DD/MM/YYYY"
                            onChange={(newDate: Dayjs | null) => { setRegisClosing(newDate) }}
                        /> */}
                        <DatePicker
                            className="w-full"
                            label="Ngày bắt đầu"
                            value={dateStart}
                            minDate={dayjs(new Date())}
                            maxDate={dayjs(semester?.dateEnd,"DD/MM/YYYY")}
                            format="DD/MM/YYYY"
                            onChange={(newDate: Dayjs | null) => { setDateStart(newDate) }}
                        />
                        <DatePicker
                            className="w-full"
                            label="Ngày kết thúc dự kiến"
                            value={dateEnd}
                            minDate={dayjs(dateStart)}
                            maxDate={dayjs(semester?.dateEnd,"DD/MM/YYYY")}
                            format="DD/MM/YYYY"
                            onChange={(newDate: Dayjs | null) => { setDateEnd(newDate) }}
                        />
                        <Button className="bg-primary" variant="contained" endIcon={<CreateIcon />}
                            onClick={handleSaveClick}
                        >
                            Tạo
                        </Button>
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