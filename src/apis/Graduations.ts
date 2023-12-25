import { ILecturer } from "./Common";
import { IStudentHasClass } from "./Scores";
import axios from "./axios.config";

const apiPrefix = "/graduations";

export interface IGraduationPreview{
    student:IStudentHasClass,
    graduationGPA:GraduationGPA,
}

export interface GraduationGPA{
    gpaFound:number,
    creditNum:number,
    pointDNum:number,
    result:boolean,
}

export interface IGradutationView{
    student:IStudentHasClass,
    supervisor:ILecturer,
    thesisAdvisor:ILecturer,
    result:string,
    graduationType:string,
    name:string,
    description:string,

}

export interface IStudentId{
    studentId:string
    result?:boolean
}

export const previewGraduationsThesis = (facultyId:number,academicYear:string,gpaFoundMin:number, creditMin:number, pointDMax:number, amount:number) =>{
    return axios.post<IGraduationPreview[]>(`${apiPrefix}/thesis/preview`,{facultyId,academicYear,gpaFoundMin,creditMin,pointDMax,amount});
}

export const addGraduationThesis = (id:number,request:IStudentId[] ) =>{
    return axios.post(`${apiPrefix}/thesis/${id}`,request)
}

export const addGraduationInternship = (id:number,request:IStudentId[] ) =>{
    return axios.post(`${apiPrefix}/internship/${id}`,request)
}

export const previewGraduationsInternship = (facultyId:number,creditMin:number) =>{
    return axios.post<IGraduationPreview[]>(`${apiPrefix}/internship/preview`,{facultyId,creditMin});
}

export const getGraduations = (facultyId:number,makeYear:string) =>{
    return axios.get<IGradutationView[]>(`${apiPrefix}/thesis`,{
        params:{
            facultyId,
            makeYear,
        }
    })
}

export const getGraduationsInternship = (facultyId:number,makeYear:string) =>{
    return axios.get<IGradutationView[]>(`${apiPrefix}/internship`,{
        params:{
            facultyId,
            makeYear,
        }
    })
}