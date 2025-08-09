import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime';
import duration from 'dayjs/plugin/duration'
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import Box from '@mui/material/Box';
import { useEffect } from 'react';

function OfferTimeLeft({ offerEndTime }) {
    const [timeLeft, setTimeLeft] = useState(getTimeLeft())

    function getTimeLeft() {
        const now = dayjs()
        const end = dayjs(offerEndTime)
        // const hoursLeft = end.diff(now, 'hour')
        // const minutesLeft = end.diff(now, 'minute')
        const totalSeconds = end.diff(now, 'second')

        if (totalSeconds <= 0) {
            return { days: 0, hours: 0, minutes: 0, seconds: 0 }
        }

        const days = Math.floor(totalSeconds / (60 * 60 * 24))
        const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / 3600)
        const minutes = Math.floor((totalSeconds % 3600) / 60)
        // const seconds = totalSeconds % 60

        return { days, hours, minutes }
        // return { hours : hoursLeft, minutes : minutesLeft, seconds : secondsLeft }
    }

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(getTimeLeft())
        }, 30000)

        return () => clearInterval(interval)
    }, [offerEndTime])

    const pad = (val) => String(val).padStart(2, '0')

    // if(timeLeft.days < 0){
        return (
            <Box>
                <Typography variant="body2" color="error"  sx={{fontSize: 16, fontWeight: 400, pt: 1}}>
                    Order within 
                    {` ${pad(timeLeft.days)}d : `}
                    {
                        timeLeft.hours > 0 ?
                        ` ${pad(timeLeft.hours)}h : `
                        :
                        null
                    }
                    {` ${pad(timeLeft.minutes)}m `}to get this price!
                    {/* Order within {timeLeft.hours} hour{timeLeft.hours !== 1 ? 's' : ''}, {timeLeft.minutes} minute{timeLeft.minutes !== 1 ? 's' : ''} to get this price! */}
                </Typography>
            </Box>
        )
    // }
}

export default OfferTimeLeft
