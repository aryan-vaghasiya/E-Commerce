import { SHOW_SNACKBAR, HIDE_SNACKBAR } from "./snackbarTypes";

const snackInitState = {
    show: false,
    message: "",
    severity: ""
}

const snackbarReducer = (state = snackInitState, action) => {
    switch(action.type){
        case SHOW_SNACKBAR: 
            return{
                show: true,
                message: action.payload.message,
                severity: action.payload.severity
            }
        case HIDE_SNACKBAR: 
            return snackInitState
        default:
            return state
    }
}

export default snackbarReducer