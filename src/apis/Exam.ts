import { ILecturer, IShiftSystem, IStudent } from "./Common";
import { IClassRegis } from "./ExamPlan";
import axios from "./axios.config";

const apiPrefix = "/exam-scheduling";

export interface IExam{
    examId:number,
    examDate:string,
    groupNumber:number,
    shiftSystem:IShiftSystem,
    classCredit:IClassRegis,
    classroomId:number,
    classroomName:string,
    students:IStudent[],
    studentSize:number,
    lecturers:ILecturer[],
}

export const getAllExam = (id:number) => {
    return axios.get<IExam[]>(`${apiPrefix}`,{
        params:{
            id
        }
    })
}

export const getAllExamToStudent = (examPlanId:number,studentId:string) => {
    return axios.get<IExam[]>(`${apiPrefix}/student`,{
        params:{
            examPlanId,
            studentId
        }
    })
}

export const getExamDetails = (id:number) => {
    return axios.get<IExam>(`${apiPrefix}/${id}`)
}

export const getStudentsInExam = (id:number) => {
    return axios.get<IStudent[]>(`${apiPrefix}/${id}/students`)
}

export const getProctoringOflecturer = () => {
    return axios.get<IStudent[]>(`${apiPrefix}/proctoring`)
}

export const changeLec = (examId:number, lecOldId:number,lecNewId:number) => {
    return axios.put(`${apiPrefix}/change-lec`,{examId,lecOldId,lecNewId})
}



