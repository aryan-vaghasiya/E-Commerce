import { ADD_DETAILS } from "./checkoutTypes";
const API_URL = import.meta.env.VITE_API_SERVER;

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
                const res = await fetch(`${API_URL}/checkout/get-form`, {
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