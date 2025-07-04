import { useFormAction } from "react-router";
import { ADD_DETAILS } from "./checkoutTypes";

const detailsInitState = {
    email: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    addLine1: "",
    addLine2: "",
    state: "",
    city: "",
    pincode: ""
}

const detailsReducer = (state=detailsInitState, action) => {
    switch(action.type){
        case ADD_DETAILS:
            return {
                email: action.payload.email,
                firstName: action.payload.fName || action.payload.first_name,
                lastName: action.payload.lName || action.payload.last_name,
                phoneNumber: action.payload.pNumber || action.payload.number,
                addLine1: action.payload.addLine1,
                addLine2: action.payload.addLine2,
                state: action.payload.state,
                city: action.payload.city,
                pincode: action.payload.pincode
            }
        default:
            return state
    }
}

export default detailsReducer