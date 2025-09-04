import { Box, Button } from '@mui/material'
import { useSelector } from 'react-redux';

function UserReferrals() {

    const userState = useSelector(state => state.userReducer)

    const generateReferral = async () => {
        try {
            const res = await fetch("http://localhost:3000/referral/generate", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${userState.token}`,
                },
            });
            if(!res.ok){
                const error = await res.json()
                return console.error("Could not generate referral:", error.error);
            }
        }
        catch (err) {
            console.error("Generating referral failed:", err.message);
        }
    }

    return (
        <Box>
            <Button onClick={() => generateReferral()}>Generate Referral Link</Button>
        </Box>
    )
}

export default UserReferrals
