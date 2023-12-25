import { IBScoreView, IBehaviorScoreDTO, IStudent } from "./Common";
import axios from "./axios.config";

const apiPrefix = "/behaviors";


export interface IBehaviorScoreView {
    bSheetId:number,
    student:IStudent,
    bScoreContent:IBScoreView[],
}


export interface IPoint {
    bCriteriaSubId: number,
    selfPoint: number,
    classPoint: number,
    advisorPoint: number,
}

export const getAllBSStudents = (classId:number,semesterId:number,index:number) =>{
    return axios.get<IBehaviorScoreView>(`${apiPrefix}/scores`,{
        params: {
            classId,
            semesterId,
            index,
        }
    })
}

export const saveBSheet = (id:number,BScoreAdd:IPoint[]) => {
    return axios.put(`${apiPrefix}/score/${id}`,BScoreAdd)
}