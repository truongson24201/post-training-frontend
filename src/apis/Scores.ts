import { IFaculty, IProfile, ISemester, IStudent } from "./Common";
import axios from "./axios.config";

const apiPrefix = "/scores";

interface StudentRegisView {
    id: number,
    student: IStudentHasClass,
    examStatus: boolean,
}

export interface IStudentHasClass {
    studentId: string,
    profile: IProfile,
    aClass: ClassDTO,
}

export interface IScores {
    regisClass: StudentRegisView,
    studentPoint: ComPointView[],
}

export interface ComPointView {
    componentSubject: ComSubjectView
    pointNumber: number,
}

interface ComSubjectView {
    comSubId: number,
    component: ComPointDTO
    percentNumber: number,
}

interface ComPointDTO {
    componentId: number,
    name: string,
    description: string,
}

interface ClassDTO {
    classId: number,
    className: string,
    faculty: IFaculty,
}

export interface IPoints {
    regisClassId: number,
    studentPoints: StudentPointAdd[],
}

export interface StudentPointAdd {
    comSubId: number,
    pointNumber: number,
}

export interface IStatus {
    regisClassId: number,
    examStatus: boolean,
}

export const getAllStudentsScores = (classCreditId: number) => {
    return axios.get<IScores[]>(`${apiPrefix}`, {
        params: {
            classCreditId
        }
    })
}


export const getScoresWithExam = (id: number) => {
    return axios.get<IScores[]>(`${apiPrefix}/exam`, {
        params: {
            id
        }
    })
}

export const saveStudentsScores = (StudentsScoresAdd: IPoints[]) => {
    return axios.put(`${apiPrefix}`, StudentsScoresAdd)
}

export const saveStudentsExamStatus = (request: IStatus[]) => {
    return axios.put(`${apiPrefix}/exam-status`, request)
}

export const updateAttendancePoint = (id: number) => {
    return axios.put(`${apiPrefix}/${id}/attendance`)
}



// ------------- Bảng điểm sinh viên ----------------
export interface ITableScoreStudent {
    semester: ISemester,
    subjectPoint: SubjectPointView[],
    semesterAverageFour: number,
    semesterAverageTen:number,
    semesterCreditNum:number,
    averageFour:number,
    averageTen:number,
    creditNum:number,
}

export interface SubjectPointView {
    subject: SubjectView,
    studentPoint: ComPointView[],
    gpa: GPA,
    classCreditId:number,
}

interface SubjectView {
    subjectId: number,
    name: string,
    creditNum: number,
    theoryNum: number,
    practicalNum: number,
    academicYear: string,
}

interface GPA {
    totalTenPoint: number,
    totalFourPoint: number,
    letterPoint: string,
    result: string
}

export const getScoreOfStudent  =(id:string) => {
    return axios.get<ITableScoreStudent[]>(`${apiPrefix}/student`,{
        params:{
            id
        }
    });
}