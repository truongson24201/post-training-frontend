import { IBCriteria, IBCriteriaSub, IBehaviorCriteriaSub } from "./BehaviorPatterns";
import axios from "./axios.config";

const apiPrefix = "/commons";

export interface ISemester {
    semesterId:string,
    num:number,
    year:number,
    dateStart:string,
    dateEnd:string,
}

export interface IStudent {
    studentId:string,
    profile:IProfile,
    aClass:IClass,
}

export interface IStudentFlat {
    studentId:string,
    profileId:number,
    fristName:string,
    lastName:string,
    DOB:string,
    gender:string,
    email:string,
    phone:string,
    address:string,
    qualification:string,
}

export interface ILecturer {
    lecturerId:string,
    profile:IProfile,
    faculty:IFaculty
}

export interface IProfile {
    profileId:number,
    fullname:string,
    DOB:string,
    gender:string,
    email:string,
    phone:string,
    address:string,
    qualification:string,
}

export interface IClass {
    classId:number,
    className:string,
    
}

export interface IBScoreView{
    bCriteria:IBCriteria,
    behaviorScores:IBehaviorScoreDTO[],
}

export interface IBehaviorScoreDTO{
    bCriteriaSub:IBehaviorCriteriaSub,
    selfPoint:number,
    classPoint:number,
    advisorPoint:number,
}

export interface ISubInfo{
    dateOpen:string,
    dateClose:string,
    isPermission:boolean,
}

export interface IFaculty{
    facultyId:number,
    name:string,
}

export const getAllSemester = () => {
    return axios.get<ISemester[]>(`${apiPrefix}/semesters`)
}

export const checkTimeUpdateSheet = (id:number) => {
    return axios.get<ISubInfo>(`${apiPrefix}-roles/feature-sheet`,{
        params:{
            id
        }
    })
}

export const getAllClass = () => {
    return axios.get<IClass[]>(`${apiPrefix}-roles/classes`)
}

export const getAllClassInExam = () => {
    return axios.get<IClass[]>(`${apiPrefix}-roles/classes-in-exam`)
}

export const getCurrentSemester = () => {
    return axios.get<ISemester>(`${apiPrefix}/semesters/current`)
}

export const getTotalStudentInClass = (id:number) => {
    return axios.get<number>(`${apiPrefix}-roles/total-student`,{
        params:{
            id
        }
    }) 
}

export const getAllFaculty = () =>{
    return axios.get<IFaculty[]>(`${apiPrefix}/faculties`)
}

export interface IShiftSystem{
    shiftSystemId:number,
    timeStart:string,
    timeClose:string,
    type:string,
}

export const getShiftSystemExam = () =>{
    return axios.get<IShiftSystem[]>(`${apiPrefix}/shift-systems`)
}

export const getAllLecturer = (id:number) => {
    return axios.get<ILecturer[]>(`${apiPrefix}/${id}/lecturers`);
}

export const getAllStudents = () =>{
    return axios.get<IStudent[]>(`${apiPrefix}-roles/students`);
}

export const getAllStudentInClass = (classId:number) =>{
    return axios.get<IStudent[]>(`${apiPrefix}/students`,{
        params:{
            classId
        }
    })
}

export const checkExpiredToEnterPoint = (semesterId:number | undefined) =>{
    return axios.get<boolean>(`${apiPrefix}/expired-semester`,{
        params:{
            semesterId
        }
    })
}

export const getSemesterToPermission = () =>{
    return axios.get<ISemester[]>(`${apiPrefix}/semester-permission`);
}

export const getAllFreeLecInExam = (examId:number) => {
    return axios.get<ILecturer[]>(`${apiPrefix}/free-lec-in-exam`,{
        params:{
            examId
        }
    })
}
