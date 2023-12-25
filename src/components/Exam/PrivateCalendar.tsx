'use client';

import useLoadingAnimation from "@/hooks/useLoadingAnimation";
import useAlert from "@/hooks/useAlert";
import { useRouter } from "next/navigation";
import React, { use, useEffect, useMemo, useState } from "react";
import moment from "moment";
import { addDays, addWeeks, endOfWeek, format, isSameDay, parse, startOfWeek, subWeeks } from "date-fns";
import { IFaculty, ILecturer, ISemester, IShiftSystem, IStudent, getAllFaculty, getAllFreeLecInExam, getAllLecturer, getAllSemester, getShiftSystemExam } from "@/apis/Common";
import { IExam, changeLec, getAllExam, getExamDetails, getStudentsInExam } from "@/apis/Exam";
import { InputLabel, MenuItem, Select, SelectChangeEvent, FormControl, Button, TextField, Autocomplete } from "@mui/material";
import { IExamPlan, getAllExamPlan, getAllExamPlanHasBuild } from "@/apis/ExamPlan";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import usePopup from "@/hooks/usePopup";
import Icon from "../Icon";
import dayjs from "dayjs";
import { isAxiosError } from "axios";

interface IView {
    dateView: string,// DD/MM/YYYY
    dayOfWeek: string // Mon, Sun, ....
}

export default function PrivateCalendar() {

    const [chooseDate, setChooseDate] = useState(new Date()); // DD/MM/YYYY
    const [examPlans, setExamPlans] = useState<IExamPlan[]>([]);
    const [FilterExamPlans, setFilterExamPlans] = useState<IExamPlan[]>([]);
    const [examPlanId, setExamPlanId] = useState<string>('');
    const loading = useLoadingAnimation();

    const [shiftSystems, setShiftSystems] = useState<IShiftSystem[]>([]);

    const [exams, setExams] = useState<IExam[]>([]);
    const [filterExams, setFilterExams] = useState<IExam[]>([]);

    const [exam, setExam] = useState<IExam>();
    const [examId, setExamId] = useState<number>();

    const [lecturers, setLecturers] = useState<ILecturer[]>([]);
    const [filterLecturers, setFilterLecturers] = useState<ILecturer[]>([]);
    const [lecturerId, setLecturerId] = useState<string>('');

    const [facultyId, setFacultyId] = useState<string>('');
    const [faculties, setfaculties] = useState<IFaculty[]>([]);

    const [semesters, setSemesters] = useState<ISemester[]>([]);
    const [semesterId, setSemesterId] = useState<number | undefined>();


    const router = useRouter();
    const popup = usePopup();

    useEffect(() => {
        fetchAllShiftSystem();
    }, [])

    useEffect(() => {
        if (examPlanId != ''){
            fetchAllExams();
            setLecturerId('');
        }
        else {
            setFilterExams([]);
            setFilterLecturers([]);
            setLecturerId('');
        }
    }, [examPlanId])

    useEffect(() => {
        if (examId != undefined)
            fetchExamDetails();
    }, [examId])

    async function fetchAllShiftSystem() {
        try {
            loading(true);
            const { data: response } = await getShiftSystemExam();
            setShiftSystems(response);
            const { data: plans } = await getAllExamPlanHasBuild();
            setExamPlans(plans);
            setFilterExamPlans(plans);
            const { data: facultiesRes } = await getAllFaculty();
            setfaculties(facultiesRes);

            const { data: seRes } = await getAllSemester();
            setSemesters(seRes);
        }
        catch (ex) {

        } finally {
            loading(false);
        }
    }

    async function fetchAllExams() {
        try {
            loading(true);
            const { data: response } = await getAllExam(Number.parseInt(examPlanId) ?? 0);
            setExams(response);
           
            const { data: lecturersRes } = await getAllLecturer(Number.parseInt(examPlanId));
            setLecturers(lecturersRes);
            setFilterLecturers(lecturersRes);
            // setFilterExams(response);
            const examplan = examPlans.find(p => p.examPlanId === Number.parseInt(examPlanId))
            setChooseDate(parse(examplan?.dateStart ?? "", 'dd/MM/yyyy', new Date()));
        }
        catch (ex) {

        } finally {
            loading(false);
        }
    }

    async function fetchExamDetails() {
        try {
            loading(true);
            const { data: response } = await getExamDetails(examId ?? 0);
            setExam(response);
        }
        catch (ex) {

        } finally {
            loading(false);
        }
    }

    const getWeekDays = (chosenDate: Date) => {
        // const chosenDay = convertToDate(chosenDate);
        const startOfChosenWeek = startOfWeek(chosenDate);

        const daysOfWeek = [0, 1, 2, 3, 4, 5, 6].map(offset => addDays(startOfChosenWeek, offset));
        return daysOfWeek;
    };
    const goToPreviousWeek = () => {
        setChooseDate(prevDate => subWeeks(prevDate, 1));
    };

    // Hàm để điều chỉnh ngày sang tuần sau
    const goToNextWeek = () => {
        setChooseDate(prevDate => addWeeks(prevDate, 1));
    };

    useEffect(() => {
        console.log(lecturerId, "lecturerId")
        if (lecturerId != '') {
            const newFilteredRows = exams.filter(e => e.lecturers.find(l => l.lecturerId === lecturerId));
            setFilterExams(newFilteredRows);
        } else {
            setFilterExams([]);
        }

    }, [lecturerId])


    useEffect(() => {

        if (facultyId != '') {
            const newFilteredRows = lecturers.filter(e => e.faculty.facultyId === Number.parseInt(facultyId));
            setLecturerId('');
            setFilterLecturers(newFilteredRows);
            setFilterExams([]);
        } else {
            const newFilteredRows = [...lecturers]
            setFilterLecturers(newFilteredRows);
            setFilterExams([]);
            setLecturerId('');
        }

    }, [facultyId])

    useEffect(() => {
        if (semesterId) {
            const filter = examPlans.filter(ep => Number.parseInt(ep.semester.semesterId) === semesterId);
            setFilterExamPlans(filter);
            setExamPlanId('');
        }
        else {
            setExamPlanId('');
        }
    }, [semesterId])


    return (
        <>
            <section className="p-2 bg-default">
                <div className="flex justify-between items-center my-3 mx-2">
                    <div className="flex w-full gap-3 items-center">
                        <FormControl variant="standard" sx={{ minWidth: 200 }}>
                            <InputLabel size="small" id="select-ExamPlan">Học kỳ</InputLabel>
                            <Select

                                labelId="select-ExamPlan"
                                id="Semester"
                                value={semesterId}
                                label="Học kỳ"
                                size="small"
                                onChange={(event: SelectChangeEvent) => {
                                    setSemesterId(Number.parseInt(event.target.value));
                                }}
                            >
                                <MenuItem value="">
                                    <em>None</em>
                                </MenuItem>
                                {semesters.map((semester, index) => {

                                    return (
                                        <MenuItem value={semester.semesterId}>
                                            <em>Học kỳ {semester.num}, năm {semester.year}-{semester.year - 1 + 2}</em>
                                        </MenuItem>
                                    )
                                })
                                }
                            </Select>
                        </FormControl>
                        <div className="">{'<'}--{'>'}</div>
                        <FormControl required sx={{ minWidth: 220 }}>
                            <InputLabel size="small" id="select-ExamPlan">Kế hoạch thi</InputLabel>
                            <Select
                                labelId="select-ExamPlan"
                                id="ExamPlan"
                                value={examPlanId}
                                label="Kế hoạch thi*"
                                size="small"
                                onChange={(event: SelectChangeEvent) => {
                                    setExamPlanId(event.target.value);
                                }}
                            >
                                {FilterExamPlans.map((exam, index) => {

                                    return (
                                        <MenuItem value={exam.examPlanId}>
                                            <em>{exam.title} ({exam.dateStart}-{exam.dateEnd})</em>
                                        </MenuItem>
                                    )
                                })
                                }
                            </Select>
                        </FormControl>
                        <div className="">----------</div>
                        <FormControl variant="standard">
                            <InputLabel id="demo-simple-select-label">Ngành</InputLabel>
                            <Select
                                className="w-60"
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={facultyId}
                                label="Ngành"
                                onChange={(event: SelectChangeEvent) => {
                                    setFacultyId(event.target.value);
                                    console.log(event.target.value, "event.target.value")
                                }}
                            >
                                <MenuItem value="">
                                    <em>All</em>
                                </MenuItem>
                                {faculties.map(d => (
                                    <MenuItem value={d.facultyId}>{d.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <div className="">{'<'}--{'>'}</div>
                        <FormControl required sx={{ minWidth: 220 }}>
                            <InputLabel size="small" id="select-ExamPlan">Giảng viên</InputLabel>
                            <Select
                                labelId="select-ExamPlan"
                                id="ExamPlan"
                                value={lecturerId}
                                label="Giảng viên*"
                                size="small"
                                onChange={(event: SelectChangeEvent) => {
                                    setLecturerId(event.target.value);
                                }}
                            >
                                {filterLecturers.map((l, index) => {

                                    return (
                                        <MenuItem value={l.lecturerId}>
                                            <em>{l.lecturerId}: ({l.profile.fullname}-{l.faculty.name})</em>
                                        </MenuItem>
                                    )
                                })
                                }
                            </Select>
                        </FormControl>
                    </div>
                    <div className="flex ">
                        <Button onClick={goToPreviousWeek} className=" text-black font-bold py-2 px-4 rounded mr-2" startIcon={<ArrowBackIosIcon />}>Previous</Button>
                        <Button onClick={goToNextWeek} className=" text-black font-bold py-2 px-4 rounded" endIcon={<ArrowForwardIosIcon />} >Next</Button>
                    </div>
                </div>

                <div className="flex p-2 w-full bg-slate-100 rounded-lg shadow-lg">
                    <div className="flex flex-col w-44">
                        <div className="font-bold mb-2 border-b h-20 bg-white grid place-items-center rounded-tl-lg">Shift System</div>
                        {/* Hiển thị các hệ thống ca làm việc */}
                        {shiftSystems.map((shift, index) => (
                            <div key={shift.shiftSystemId} className={`mb-2  bg-white grid place-items-center ${index === shiftSystems.length - 1 ? 'rounded-bl-lg h-40' : 'h-36'
                                }`}>
                                {/* <p>Shift ID: {shift.shiftSystemId}</p> */}
                                <p>{shift.timeStart} -{'>'} {shift.timeClose}</p>
                            </div>
                        ))}
                    </div>
                    {chooseDate && (
                        <div className="flex justify-center ml-3 w-full ">
                            {getWeekDays(chooseDate).map(day => (
                                <div className="flex flex-col gap-4 bg-default w-full mb-2 border" key={day.toISOString()}>
                                    {/* Hiển thị thông tin về các ngày trong tuần */}
                                    <div className="bg-default flex flex-col items-center pt-2">
                                        <p className="text-xl font-bold">{format(day, 'EEE')}</p>
                                        <p className="border-b italic pb-4">{format(day, 'dd/MM/yyyy')}</p>
                                    </div>
                                    {shiftSystems.map(shift => {
                                        const examsForShift = filterExams.filter(exam => exam.examDate === format(day, 'dd/MM/yyyy') && exam.shiftSystem.shiftSystemId === shift.shiftSystemId);
                                        if (examsForShift.length > 0) {
                                            // Nếu có kỳ thi được lên lịch cho ca làm việc này, hiển thị thông tin
                                            return (
                                                <div className="border-b h-36 -mt-1">
                                                    <div className="flex flex-col border shadow-lg p-3 bg-green-100 h-full mx-2 rounded-lg -my-2 " key={shift.shiftSystemId}
                                                        onClick={() => {
                                                            const examPop = filterExams.find(exam => exam.examDate === format(day, 'dd/MM/yyyy') && exam.shiftSystem.shiftSystemId === shift.shiftSystemId)
                                                            popup.show(
                                                                examPop && <InfoExam fetchAllExams={fetchAllExams} hidePopup={popup.hide} exam={examPop} />
                                                            )
                                                        }}
                                                    >
                                                        {examsForShift.map(exam => (
                                                            <div key={`${exam.examDate}-${exam.shiftSystem.shiftSystemId}`} className="flex flex-col gap-2">
                                                                <p className="font-semibold">{exam.classCredit.subject}</p>
                                                                <p>Phòng: {exam.classroomName}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        } else {
                                            // Nếu không có kỳ thi nào được lên lịch cho ca làm việc này, hiển thị một phần tử rỗng
                                            return (
                                                <div className="border-b h-36 -mt-1">
                                                    <div className="flex flex-col mx-2 h-28 rounded-lg bg-default" key={shift.shiftSystemId}>
                                                        <p></p>
                                                    </div>
                                                </div>
                                            );
                                        }
                                    })}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </>
    )
}

function InfoExam({
    exam,
    hidePopup,
    fetchAllExams,
}: {
    exam: IExam
    hidePopup: () => void,
    fetchAllExams: () => Promise<void>
}) {
    const router = useRouter();
    const [updateLec, setUpdateLec] = useState<boolean>(false);
    const [freeLecs, setFreeLecs] = useState<ILecturer[]>([]);
    const [lecOldId, setLecOldId] = useState<string>('');
    const [lecNewId, setLecNewId] = useState<string>('');
    const [lecName, setLecName] = useState<string>('');
    const [hasChange, setHasChange] = useState<boolean>();
    const openAlert = useAlert();

    useEffect(() => {
        fetchFreeLecInExam(exam.examId);
    }, [])

    async function fetchFreeLecInExam(examId: number) {
        try {
            const { data: res } = await getAllFreeLecInExam(examId);
            setFreeLecs(res);
            const inputDate = dayjs(exam.examDate, 'DD/MM/YYYY');
            const currentDate = dayjs();
            if (inputDate.isSame(currentDate) || inputDate.isAfter(currentDate))
                setHasChange(true);
            if (res.length === 0) {
                openAlert({
                    severity: "error",
                    message: "Không có giám thị nào rảnh trong ngày này và ca thi này",
                });
            }
        } catch (error) {

        }

    }

    const handleChangeLec = async () => {
        if (lecNewId != '')
            try {
                const {data : response} = await changeLec(exam.examId,Number.parseInt(lecOldId),Number.parseInt(lecNewId));
                openAlert({
                    severity: "success",
                    message: response
                });
                fetchAllExams();
            } catch (error) {
                if (isAxiosError(error)) {
                    openAlert({
                        severity: "error",
                        message: error.response?.data
                    });
                }
            }finally {

            }
    }


    return (
        <>
            <section className="flex flex-col gap-5 w-96 py-5 bg-white border-4 border-gray-200 rounded-md zoom-in items-center">
                <h2 className="font-bold text-xl mx-auto text-slate-600 ">{exam.classCredit.subject}</h2>
                <h2 className="font-bold text-lg mx-auto text-slate-600 ">Nhóm: {exam.groupNumber}</h2>
                <p className="font-bold text-lg  text-slate-600">Classroom: {exam.classroomName}</p>
                <div className="flex flex-col justify-start w-full px-4 gap-4">
                    <p className="text-lg ">Danh sách giám thị</p>
                    {
                        exam.lecturers.map((l) =>
                            <div className="flex flex-col my-2 mx-4 gap-1">
                                <div className="flex">
                                    <p className="">Giám thị: {l.lecturerId} {"|"} </p>
                                    <p className="italic cursor-pointer px-2" >
                                        {l.profile.fullname}
                                    </p>
                                    {
                                        hasChange &&
                                        <p className="italic px-2"
                                            onClick={() => {
                                                setLecOldId(l.lecturerId);
                                                setLecName(l.profile.fullname);
                                                setUpdateLec(true)
                                            }}
                                        >
                                            <Icon pointer="true" name="repeat" />
                                        </p>
                                    }
                                </div>
                            </div>
                        )

                    }
                    {
                        updateLec &&
                        <div className="flex justify-between items-center gap-2">
                            <Autocomplete
                                onChange={(event, newValue) => {
                                    if (newValue) {
                                        setLecNewId(newValue.lecturerId);
                                    }
                                }}
                                size="small"
                                disablePortal
                                id="combo-box-demo"
                                options={freeLecs}
                                sx={{ width: 300 }}
                                getOptionLabel={(option) => `${option.lecturerId} | ${option.profile.fullname}`}
                                renderInput={(params) => <TextField {...params} placeholder={`Thay ID:${lecOldId} | ${lecName}`} />}
                            />
                            <p className="cursor-pointer text-lg"
                                onClick={() => {
                                    handleChangeLec();
                                    hidePopup();
                                }}

                            ><Icon pointer="true" name="download" /></p>
                        </div>
                    }
                    <p className="cursor-pointer text-lg"
                        onClick={() => {
                            router.push(`exam/${exam.examId}`);
                            hidePopup();
                        }}

                    >Danh sách sinh viên: {exam.studentSize} <Icon name="eye" /></p>
                </div>
            </section>
        </>
    )
}