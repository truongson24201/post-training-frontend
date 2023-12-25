'use client';

import { CustomTabPanel } from "@/components/TabPanel";
import { Tab, Tabs } from "@mui/material";
import { useState } from "react";
import ScoresWithClass from "@/components/Scores/ScoresWithClass";
import ScoresWithExam from "@/components/Scores/ScoresWithExam";
export default function Page() {

    const [tabValue, setTabValue] = useState<0 | 1>(0);
    // const openAlert = useAlert();
    function handleChangeTab(event: React.SyntheticEvent, newValue: 0 | 1) {
        setTabValue(newValue);
    }


    const role: string[] = JSON.parse(localStorage.getItem("roles") ?? "");
    const disable = role.includes("TQA");

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
                            <Tab label="Điểm thành phần" id="simple-tab-0" aria-controls="simple-tabpanel-0" />
                            {disable &&
                                <Tab label="Điểm cuối kỳ" id="simple-tab-1" aria-controls="simple-tabpanel-1" />
                            }
                        </Tabs>
                    </header>
                    <main className=" drop-shadow-sm bg-default ">
                        <CustomTabPanel value={tabValue} index={0}>
                            <ScoresWithClass />
                        </CustomTabPanel>
                        {disable &&
                            <CustomTabPanel value={tabValue} index={1}>
                                <ScoresWithExam />
                            </CustomTabPanel>
                        }
                    </main>
                </div>
            </div>

        </>
    )

}