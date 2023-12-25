import { IStudent } from "./Common";
import { IStudentHasClass } from "./Scores";
import axios from "./axios.config";

const apiPrefix = "/rewards";

export interface IReward{
    student:IStudentHasClass,
    gpaReward:IGpaReward,
}

export interface IGpaReward{
    totalTenPoint:number,
    totalFourPoint:number,
    totalBehaviorPoint:number,
    content:string,
}

export interface AddReward{
    studentId:string,
    gpaFound:number,
    gpaBehavior:number, 
    content:string 
}

export const previewRewardsStudents = (facultyId:number,semesterId:number, scoreMin:number, behaviorMin:number, amount:number) =>{
    return axios.post<IReward[]>(`${apiPrefix}/preview`,{facultyId,semesterId,scoreMin,behaviorMin,amount})
}

export const checkHasReward = (facultyId:number,semesterId:number) =>{
    return axios.get(`${apiPrefix}/check`,{
        params:{
            facultyId,
            semesterId
        }
    })
}

export const addRewardsStudents = (semester:number,addReward:AddReward[] ) =>{
    return axios.post(`${apiPrefix}/${semester}`,addReward)
}

export const updateRewardsStudents = (faculty:number,semester:number,addReward:AddReward[] ) =>{
    return axios.put(`${apiPrefix}/${faculty}/${semester}`,addReward)
}

export const getRewardsStudents = (semesterId:number) =>{
    return axios.get<IReward[]>(`${apiPrefix}`,{
        params:{
            semesterId
        }
    })
}


