'use client';

import { CustomTabPanel } from "@/components/TabPanel";
import { Alert, Snackbar, Tab, Tabs } from "@mui/material";
import { useState } from "react";
import useAlert from "@/hooks/useAlert";
import GeneralCalendar from "@/components/Exam/GeneralCalendar";
import PrivateCalendar from "@/components/Exam/PrivateCalendar";
import StudentsCalendar from "@/components/Exam/StudentsCalendar";

export default function Page() {

    const [tabValue, setTabValue] = useState<0 | 1 | 2>(0);
    // const openAlert = useAlert();
    function handleChangeTab(event: React.SyntheticEvent, newValue: 0 | 1) {
        setTabValue(newValue);
    }


    const role: string[] = JSON.parse(localStorage.getItem("roles") ?? "");

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
                            <Tab label="Lịch thi" id="simple-tab-0" aria-controls="simple-tabpanel-0" />
                            <Tab label="Lịch coi thi" id="simple-tab-1" aria-controls="simple-tabpanel-1" />
                            <Tab label="Lịch thi của sinh viên" id="simple-tab-1" aria-controls="simple-tabpanel-1" />
                        </Tabs>
                    </header>
                    <main className=" drop-shadow-sm bg-default ">
                        <CustomTabPanel value={tabValue} index={0}>
                            <GeneralCalendar />
                        </CustomTabPanel>
                        <CustomTabPanel value={tabValue} index={1}>
                            <PrivateCalendar />
                        </CustomTabPanel>
                        <CustomTabPanel value={tabValue} index={2}>
                            <StudentsCalendar />
                        </CustomTabPanel>
                    </main>
                </div>
            </div>

        </>
    )

}