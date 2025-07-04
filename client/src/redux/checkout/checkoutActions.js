import { ADD_DETAILS } from "./checkoutTypes";

export const addDetails = (details) => {
    return {
        type: ADD_DETAILS,
        payload: details
    }
}

export const fetchDetails = (token) => {
        return async (dispatch) => {
            // console.log("Token : ", token);
            
            // const token = getState().userReducer.token
            try {
                const res = await fetch("http://localhost:3000/checkout/get-form", {
                    headers: {
                    Authorization: `Bearer ${token}`,
                    },
                });
                if(!res.ok){
                    const error = await res.json()
                    console.error("Could not fetch Form:", error.error);
                    return false
                }
                const formData = await res.json();
                // console.log("Form Data: ",formData[0]);
                dispatch(addDetails(formData[0]));
            }
            catch (err) {
                console.error("Details fetch failed:", err.message);
            }
        }
}