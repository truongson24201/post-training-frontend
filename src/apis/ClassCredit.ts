import { IClassRegis } from "./ExamPlan";
import axios from "./axios.config";

const apiPrefix = "/class-credit";


export interface IComponentPoint{
    componentId:number,
    name:string,
    description:string
}

export const getCCToRegis = (semesterId:number | undefined) =>{
    return axios.get<IClassRegis[]>(`${apiPrefix}/regis`,{
        params:{
            semesterId
        }
    })
}

export const checkClassCreditOfLec = (classCreditId:number) =>{
    return axios.get<boolean>(`${apiPrefix}/regis/check`,{
        params:{
            classCreditId
        }
    })
}

export const getCCToEnterPoint = (semesterId:number | undefined) =>{
    return axios.get<IClassRegis[]>(`${apiPrefix}`,{
        params:{
            semesterId
        }
    })
}

// export const getCCInSesmterAndFaculty = (semesterId:number | undefined,facultyId:nunmber | undefined) =>{
//     return axios.get<IClassRegis[]>(`${apiPrefix}`,{
//         params:{
//             semesterId,
//             facultyId
//         }
//     })
// }

export const getAllComponents = (classCreditId:number) => {
    return axios.get<IComponentPoint[]>(`${apiPrefix}/components`,{
        params:{
            classCreditId
        }
    })
}

export const getComponent = () => {
    return axios.get<IComponentPoint[]>(`${apiPrefix}/component`)
}

export const updateIsComplete = (id:number) => {
    return axios.put(`${apiPrefix}/${id}/complete`)
}

export const getAttendancePoint = (id:number) => {
    return axios.get(`${apiPrefix}/attendance`,{
        params:{
            id
        }
    })
}

export const checkHasEnterCK = (classCreditId:number) =>{
    return axios.get<boolean>(`${apiPrefix}/enter-ck`,{
        params:{
            classCreditId
        }
    })
}

