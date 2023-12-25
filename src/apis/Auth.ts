import axios from "./axios.config";

const apiPrefix = "/v1/auth";


interface ILoginRequest {
    username: string,
    password: string,
}
interface ILoginResponse {
    accessToken: string,
    roles: string[],
}


export const login = (loginRequest: ILoginRequest) => {
    return axios.post<ILoginResponse>(`${apiPrefix}/login`, loginRequest);
}