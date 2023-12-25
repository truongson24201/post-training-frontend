'use client';

import { CustomTabPanel } from "@/components/TabPanel";
import BehaviorPatternTable from "@/components/Behaviors/BehaviorPattern";
import { useState } from "react";

export default function Page() {
    return (
        <div className="h-screen w-full p-5 bg-white">
            <div className="w-full h-full flex flex-col rounded-xl overflow-hidden">
                <main className=" drop-shadow-sm bg-default ">
                    <BehaviorPatternTable />
                </main>
            </div>
        </div>
    )
}