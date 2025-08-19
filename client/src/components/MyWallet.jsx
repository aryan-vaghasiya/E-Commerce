import Box from '@mui/material/Box'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'

function MyWallet() {

    const userState = useSelector(state => state.userReducer)

    const fetchWallet = async () => {
        try{
            const response = await fetch(`http://localhost:3000/wallet/get-wallet`, {
                headers: {
                    Authorization : `Bearer ${userState.token}`
                }
            })

            if(!response.ok){
                const error = await response.json()
                return console.log(error)
            }
            const result = await response.json()
            console.log(result)
        }
        catch(err){
            console.error(err.message)
        }
    }

    useEffect(() => {
        fetchWallet()
    },[])

    return (
        <Box>
            My Wallet
        </Box>
    )
}

export default MyWallet
