'use client';
import { Button, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import CreateIcon from '@mui/icons-material/Create';
import { useState } from "react";

export default function EnhancedTableToolbar({
    comboxSearch,
    actionHandler,
}: {
    comboxSearch: boolean;
    actionHandler?: () => void;
}) {

    return (
        <div className="h-16 px-3 flex justify-between items-center">
            <div className="w-full">
                {
                    comboxSearch && (
                        <></>
                    )
                }
            </div>

            <div className="flex gap-3">
                <Button className="bg-primary" variant="contained" endIcon={<CreateIcon />}
                    onClick={actionHandler}
                >
                    Tạo
                </Button>
            </div>
        </div>
    )
}