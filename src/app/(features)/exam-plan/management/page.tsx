'use client';

import { CustomTabPanel } from "@/components/TabPanel";
import ExamPlanTable from "@/components/ExamPlan/ExamPlanTableView";
import { Alert, Snackbar, Tab, Tabs } from "@mui/material";
import { useState } from "react";
import ExamPlanFormAdd from "@/components/ExamPlan/ExamPlanFormAdd";
import useAlert from "@/hooks/useAlert";
import Registation from "../registation/page";
import BuildExams from "./build-exams/page";
export default function Page() {

    const [tabValue, setTabValue] = useState<0 | 1>(0);
    // const openAlert = useAlert();
    function handleChangeTab(event: React.SyntheticEvent, newValue: 0 | 1) {
        setTabValue(newValue);
    }

    const role: string[] = JSON.parse(localStorage.getItem("roles") ?? "");
    const disable = role.includes("lecturer");
    if (!disable) {
        return (
            <>
                <div className="h-screen w-full p-5 bg-white">
                    <div className="w-full h-full flex flex-col rounded-xl overflow-hidden">
                        <header className="flex-shrink-0 h-14 flex items-center gap-4 border-b ">
                            <Tabs
                                value={tabValue}
                                onChange={handleChangeTab}
                                aria-label="basic tabs example"
                            >
                                <Tab label="Kế hoạch thi" id="simple-tab-0" aria-controls="simple-tabpanel-0" />
                                <Tab label="Tạo lịch thi" id="simple-tab-1" aria-controls="simple-tabpanel-1" />
                            </Tabs>
                        </header>
                        <main className=" drop-shadow-sm bg-default ">
                            <CustomTabPanel value={tabValue} index={0}>
                                <ExamPlanTable url="management" />
                            </CustomTabPanel>
                            <CustomTabPanel value={tabValue} index={1}>
                                <BuildExams url="management/build-exams/" />
                            </CustomTabPanel>

                        </main>
                    </div>
                </div>

            </>
        )
    } else {
        return (
            <div className="h-screen w-full p-5 bg-white">
                <Snackbar anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
                    open={true}

                >
                    <Alert severity="error">Bạn không có quyền truy cập vào chức năng này</Alert>
                </Snackbar>
            </div>
        )
    }
}