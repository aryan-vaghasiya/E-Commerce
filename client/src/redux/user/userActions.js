import { ADD_USER } from "./userTypes";

export const addUser = (username, token, role) => {
    return{
        type: ADD_USER,
        payload: {username, token, role}
    }
}