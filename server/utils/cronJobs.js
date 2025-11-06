const runQuery = require(`../db`)
const adminServices = require(`../services/adminServices`)

exports.tenMinuteCronJob = async () => {
    try{
        console.log('Updating coupon status, every 10 minutes');
        await runQuery(`UPDATE coupons SET is_active = ? WHERE NOW() BETWEEN start_time AND end_time`, [1])
        await runQuery(`UPDATE coupons SET is_active = ? WHERE coupons_left <= 0`, [0])
        await runQuery(`UPDATE coupons SET is_active = ? WHERE end_time <= NOW() AND is_active = ?`, [0, 1])

        console.log('Updating product discount status, every 10 minutes');
        await runQuery(`UPDATE product_discounts SET is_active = ? WHERE NOW() BETWEEN start_time AND end_time`, [1])
        await runQuery(`UPDATE product_discounts SET is_active = ? WHERE  NOW() NOT BETWEEN start_time AND end_time AND is_active = ?`, [0, 1])
    }
    catch(err){
        console.error('Error in 10 min. cron job:', err);
    }
}

let campaignRunning = false
exports.campaignCronJob = async() => {
    if(campaignRunning){
        console.log("Previous job still running, skipping this one");
        return;
    }

    campaignRunning = true
    try{
        console.log("Checking for pending campaigns every 5 minutes");

        const campaigns = await runQuery(`
            SELECT 
                id 
            FROM campaigns 
            WHERE status = ?
                AND scheduled_at <= NOW()
        `, ["scheduled"]);

        for (let campaign of campaigns) {
            await adminServices.sendCampaignEmailService(campaign.id);
        }
    }
    catch(err){
        console.error('Error in campaign cron job:', err);
    }
    finally{
        campaignRunning = false
    }
}