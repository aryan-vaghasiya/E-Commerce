import { ADD_USER } from "./userTypes";

const userInitState = {
    userName: "",
    // password: "",
    token: ""
}

const userReducer = (state=userInitState, action) => {
    switch(action.type){
        case ADD_USER:
            return {
                userName: action.payload.username,
                // password: action.payload.user.password,
                token: action.payload.token
            }
        default:
            return state
    }
}

export default userReducer