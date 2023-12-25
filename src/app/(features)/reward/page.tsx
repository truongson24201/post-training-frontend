'use client';

import { CustomTabPanel } from "@/components/TabPanel";
import ExamPlanTable from "@/components/ExamPlan/ExamPlanTableView";
import { Alert, Snackbar, Tab, Tabs } from "@mui/material";
import { useState } from "react";
import ExamPlanFormAdd from "@/components/ExamPlan/ExamPlanFormAdd";
import useAlert from "@/hooks/useAlert";
import ViewReward from "@/components/Reward/ViewReward";
import AddReward from "@/components/Reward/AddReward";
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
                            <Tab label="Danh sách học bổng" id="simple-tab-0" aria-controls="simple-tabpanel-0" />
                            <Tab label="Xet học bổng" id="simple-tab-1" aria-controls="simple-tabpanel-1" />
                        </Tabs>
                    </header>
                    <main className=" drop-shadow-sm bg-default ">
                        <CustomTabPanel value={tabValue} index={0}>
                            <ViewReward />
                        </CustomTabPanel>
                        <CustomTabPanel value={tabValue} index={1}>
                            <AddReward />
                        </CustomTabPanel>

                    </main>
                </div>
            </div>

        </>
    )
}