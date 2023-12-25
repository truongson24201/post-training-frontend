import axios from "./axios.config";

const apiPrefix = "/behaviors";

export interface IBehaviorPattern {
    ordinal:number;
    bSPatternId: number;
    dateOpen: string;
    dateClose: string;
    status: string;
    updateOn:string;
    updateBy:string;
}

export interface IBPContents {
    ordinal:number;
    bCriteriaSubId: number;
    name: string;
    description: string;
    bCriteria:IBehaviorCriteria[];
}

export interface IBehaviorCriteria {
    // ordinal:number;
    bCriteriaId: number;
    name: string;
    bCriteriaSubs:IBehaviorCriteriaSub[];
}

export interface IBCriteria {
    // ordinal:number;
    bCriteriaId: number;
    name: string;
    status:boolean;
    // bCriteriaSubs:IBehaviorCriteriaSub[];
}

export interface IBCriteriaSub {
    bCriteriaSubId: number;
    name: string;
    description: string;
    status:boolean;
}

export interface IBehaviorCriteriaSub {
    // ordinal:number;
    bCriteriaSubId: number;
    name: string;
    description: string;
    maxPoint:number,
    // bCriteria:IBehaviorCriteria;
}


export const getBehaviorPatterns = () => {
    return axios.get<IBehaviorPattern[]>(`${apiPrefix}/patterns`);
}

export const openPattern = (id:number) => {
    return axios.put(`${apiPrefix}/pattern/${id}`);
}

// export const getBSPatternContent = () => {
//     return axios.get<IBehaviorCriteriaSub[]>(`${apiPrefix}/pattern-contents`)
// }

export const getBSPatternContent = () => {
    return axios.get<IBehaviorCriteria[]>(`${apiPrefix}/pattern-contents`)
}

export const getBSPatternContentDetails = (bSPatternId:number) => {
    return axios.get<IBehaviorCriteria[]>(`${apiPrefix}/pattern-contents/details`,{
        params: {bSPatternId}
    })
}

export const checkPatternDisable = (bSPatternId:number) => {
    return axios.get<boolean>(`${apiPrefix}/pattern/details`,{
        params: {bSPatternId}
    })
}


export const getAllBCriteria = () => {
    return axios.get<IBCriteria[]>(`${apiPrefix}/criteria`)
}

export const getAllBCriteriaSub = (id:number) => {
    return axios.get<IBCriteriaSub[]>(`${apiPrefix}/criteria/${id}/subs`)
}

export const getCriteriaDetail = (id:number) => {
    return axios.get<IBCriteria>(`${apiPrefix}/criteria-detail`, {
        params: {
            id
        }
    })
}

export const getCriteriaSubDetail = (subId:number | undefined) => {
    return axios.get<IBCriteriaSub>(`${apiPrefix}/criteria/sub`,{
        params: {
            subId
        }
    })
}

export const addCriteria = (name:string) => {
    return axios.post<IBCriteria>(`${apiPrefix}/criteria`,name)
}

export const editCriteria = (bCriteriaId:number,name:string,status:boolean) => {
    return axios.put<IBCriteria>(`${apiPrefix}/criteria`,{bCriteriaId,name,status})
}

export const deleteCriteria = (id:number) => {
    return axios.delete<IBCriteria>(`${apiPrefix}/criteria`,{
        params: {
            id
        }
    })
}

export const deleteCriteriaSub = (id:number | undefined) => {
    return axios.delete<IBCriteria>(`${apiPrefix}/criteria/sub`,{
        params: {
            id
        }
    })
}

export const editCriteriaSub = (bCriteriaSubId:number,name:string,description:string,status:boolean) => {
    return axios.put<IBCriteriaSub>(`${apiPrefix}/criteria/sub`,{bCriteriaSubId,name,description,status})
}

export const addCriteriSub = (bCriteriaId:number,name:string,description:string) => {
    return axios.post<IBCriteriaSub>(`${apiPrefix}/criteria/sub`,{bCriteriaId,name,description})
}

export const addBSPatternContent = (BSContentAdd: {bCriteriaSubId:number,maxPoint:number | undefined}[]) => {
    return axios.post(`${apiPrefix}/pattern`,BSContentAdd)
}

export const updateContentPattern = (bSPatternId:number,BSContentAdd: {bCriteriaSubId:number,maxPoint:number | undefined}[]) => {
    return axios.put(`${apiPrefix}/pattern-contents/${bSPatternId}/details`,BSContentAdd)
}

export const deletePattern = (bSPatternId:number) => {
    return axios.delete(`${apiPrefix}/pattern/details`,{
        params: {bSPatternId}
    })
}
