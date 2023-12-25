'use client';

import { CustomTabPanel } from "@/components/TabPanel";
import BPContentsTable from "@/components/Behaviors/BPContentsTable";
import FormAddCriteria from "@/components/Behaviors/FormAddCriteria";
import useAlert from "@/hooks/useAlert";
import { Tab, Tabs } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";



export default function Page() {
    const router = useRouter();
    const openAlert = useAlert();

    const [tabValue, setTabValue] = useState<0 | 1>(0);
    
    function handleChangeTab(event: React.SyntheticEvent, newValue:0 | 1) {
        setTabValue(newValue);
    }

    return (
        <>
            <div className="h-screen w-full p-5 bg-white">
                <div className="w-full h-full flex flex-col rounded-xl ">
                    <header className="flex-shrink-0 h-14 flex items-center gap-4 border-b ">
                        <Tabs
                            value={tabValue}
                            onChange={handleChangeTab}
                            aria-label="basic tabs example"
                        >
                            <Tab label="Tạo nội dung" id="simple-tab-0" aria-controls="simple-tabpanel-0" />
                            <Tab label="Thêm tiêu chí" id="simple-tab-1" aria-controls="simple-tabpanel-1" />
                        </Tabs>
                    </header>
                    <main className=" drop-shadow-sm bg-default ">
                        <CustomTabPanel value={tabValue} index={0}>
                            <BPContentsTable  />
                        </CustomTabPanel>
                        <CustomTabPanel value={tabValue} index={1}>
                            <FormAddCriteria  />
                        </CustomTabPanel>
                    </main>
                </div>
            </div>

        </>
    )
}