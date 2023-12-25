import { Dayjs } from "dayjs";
import { ISemester } from "./Common";
import axios from "./axios.config";

const apiPrefix = "/exam-plan";

export interface IExamPlan {
    examPlanId:number,
    dateStart:string,
    dateEnd:string,
    title:string,
    isDelete:string,
    semester:ISemester,
    flag:string,
    status:string,
    
}

export interface IClassRegis{
    classCreditId:number,
    subjectId:number,
    subject:string,
    numberExamGroups:number,
    examType:string,
    lecturerId:number,
    lecturerName:string,
    facultyId:string,
    facultyName:string,
    numberStudents:number,
    isCompleted:string,

}

export const getAllExamPlan = () =>{
    return axios.get<IExamPlan[]>(`${apiPrefix}`)
}

export const getAllExamPlanHasBuild = () =>{
    return axios.get<IExamPlan[]>(`${apiPrefix}/build`)
}

export const addExamPlan = (dateStart:string,dateEnd:string,title:string) =>{
    return axios.post(`${apiPrefix}`,{title,dateStart,dateEnd})
}

export const getExamPlanDetails = (id:number) =>{
    return axios.get<IExamPlan>(`${apiPrefix}/${id}`)
}

export const getRegisInExamPlan = (id:number) =>{
    return axios.get<IClassRegis[]>(`${apiPrefix}/${id}/regis`)
}

export const updateExamPlan = (id:number,dateStart:string,dateEnd:string,title:string) => {
    return axios.put(`${apiPrefix}/${id}`,{title,dateStart,dateEnd})
}

export const deleteExamPlan = (id:number) => {
    return axios.delete(`${apiPrefix}`,{
        params:{
            id
        }
    })
}

export const getAllExamType = ()=>{
    return axios.get(`${apiPrefix}/types`)
}

export const regisInExamPlan = (examPlanId:number,classCreditId:number, numberExamGroup:number, examType:string) =>{
    return axios.post<IClassRegis>(`${apiPrefix}/regis`,{examPlanId,classCreditId,numberExamGroup,examType})
}

export const updateClassInExamPlan = (examPlanId:number,classCreditId:number, numberExamGroup:number, examType:string) =>{
    return axios.put(`${apiPrefix}/cc`,{examPlanId,classCreditId,numberExamGroup,examType})

}

export const deleteClassInExamPlan = (id:number) => {
    return axios.delete(`${apiPrefix}/cc`,{
        params:{
            id
        }
    })
}

export const buildExamScheduling = (examPlanId:number) =>{
    return axios.post(`${apiPrefix}/build`,{examPlanId})
}

export const openExamPlan = (id:number) =>{
    return axios.put(`${apiPrefix}/${id}/turn`)
}

export const closeExamPlanHasExpired = () =>{
    return axios.put(`${apiPrefix}/has-expired`)
}
