'use client';

import { CustomTabPanel } from "@/components/TabPanel";
import { Alert, Snackbar, Tab, Tabs } from "@mui/material";
import { useState } from "react";
import useAlert from "@/hooks/useAlert";
import GraduaTionView from "@/components/Graduation-thesis/GraduationThesisView";
import GraduationAdd from "@/components/Graduation-thesis/GraduationThesisAdd";
import GraduationInternshipView from "@/components/Graduation-internship/GraduationInternshipView";
import GraduationInternshipAdd from "@/components/Graduation-internship/GraduationInternshipAdd";

export default function Page() {

    const [tabValue, setTabValue] = useState<0 | 1>(0);
    // const openAlert = useAlert();
    function handleChangeTab(event: React.SyntheticEvent, newValue: 0 | 1) {
        setTabValue(newValue);
    }

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
                            <Tab label="Danh sách làm thực tập tốt nghiệp" id="simple-tab-0" aria-controls="simple-tabpanel-0" />
                            <Tab label="Xét điều kiện làm thực tập tốt nghiệp" id="simple-tab-1" aria-controls="simple-tabpanel-1" />
                        </Tabs>
                    </header>
                    <main className=" drop-shadow-sm bg-default ">
                        <CustomTabPanel value={tabValue} index={0}>
                            <GraduationInternshipView />
                        </CustomTabPanel>
                        <CustomTabPanel value={tabValue} index={1}>
                            <GraduationInternshipAdd />
                        </CustomTabPanel>
                    </main>
                </div>
            </div>

        </>
    )

}