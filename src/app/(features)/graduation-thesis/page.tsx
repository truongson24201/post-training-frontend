'use client';

import { CustomTabPanel } from "@/components/TabPanel";
import { Alert, Snackbar, Tab, Tabs } from "@mui/material";
import { useState } from "react";
import useAlert from "@/hooks/useAlert";
import GraduationThesisView from "@/components/Graduation-thesis/GraduationThesisView";
import GraduationThesisAdd from "@/components/Graduation-thesis/GraduationThesisAdd";

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
                            <Tab label="Danh sách làm đồ án tốt nghiệp" id="simple-tab-0" aria-controls="simple-tabpanel-0" />
                            <Tab label="Xét điều kiện làm đồ án tốt nghiệp" id="simple-tab-1" aria-controls="simple-tabpanel-1" />
                        </Tabs>
                    </header>
                    <main className=" drop-shadow-sm bg-default ">
                        <CustomTabPanel value={tabValue} index={0}>
                            <GraduationThesisView />
                        </CustomTabPanel>
                        <CustomTabPanel value={tabValue} index={1}>
                            <GraduationThesisAdd />
                        </CustomTabPanel>
                    </main>
                </div>
            </div>

        </>
    )

}