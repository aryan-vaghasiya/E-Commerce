import { SHOW_SNACKBAR, HIDE_SNACKBAR } from "./snackbarTypes";

export const showSnack = (snackData) => {
    return{
        type: SHOW_SNACKBAR,
        payload: snackData
    }
}

export const hideSnack = () => {
    return{
        type: HIDE_SNACKBAR,
    }
}