import { GET_DASHBOARD_DATA } from "./dashboardTypes";
const API_URL = import.meta.env.VITE_API_SERVER;

const getDashboardData = (data) => {
    return{
        type: GET_DASHBOARD_DATA,
        payload: data
    }
}

// export const fetchDashboard = (token) => {
//     return async (dispatch) => {
//         // const token = getState().userReducer.token
//         try {
//             const res = await fetch(`${API_URL}/admin/get-dashboard`, {
//                 headers: {
//                 Authorization: `Bearer ${token}`,
//                 }, 
//             });
//             if(!res.ok){
//                 const error = await res.json()
//                 console.error("Could not fetch Dashboard Data:", error.error);
//                 return false
//             }
//             const data = await res.json();
//             // console.log(data);
            
//             dispatch(getDashboardData(data));
//         }
//         catch (err) {
//             console.error("Dashboard fetch failed:", err.message);
//         }
//     };
// };