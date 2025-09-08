const runQuery = require("../db")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt")
const {sendMail} = require("../mailer/sendMail")
const crypto = require("crypto");

exports.loginUser = async(username, password) => {
    const result = await runQuery("SELECT * FROM users WHERE username = ?", [username])
    if (result.length === 0) {
        throw new Error ("User not found")
    }

    const user = result[0];
    const matched = await bcrypt.compare(password, user.password);
    if (matched) {
        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                role: "user"
            },
            process.env.JWT_SECRET,
            { expiresIn: "10h" }
        );
        return token
    }
    else {
        throw new Error("Wrong Password")
    }
}

exports.signupUser = async(username, password, fName, lName, email, referral) => {

    let referrer
    if(referral){
        const [checkReferralCode] = await runQuery(`SELECT * FROM users WHERE referral_code = ?`, [referral])
        if(!checkReferralCode){
            throw new Error("Invalid Referral Code")
        }
        referrer = checkReferralCode
    }

    const getUserName = await runQuery("SELECT * FROM users WHERE username = ?", [username])
    if (getUserName.length > 0) {
        throw new Error ("User already Exists, Please Login")
    }

    const getUserEmail = await runQuery("SELECT * FROM users WHERE email = ?", [email])
    if (getUserEmail.length > 0) {
        throw new Error ("Email already in use, Please try another email")
    }

    const hashedPass = await bcrypt.hash(password, 10);
    const result = await runQuery("INSERT INTO users (username, password, first_name, last_name, email) VALUES (?, ?, ?, ?, ?)", [username, hashedPass, fName, lName ?? null, email])
    if (result.affectedRows === 0) {
        throw new Error ("Can't Signup User")
    }

    const userId = result.insertId;

    if(referral){
        const recordUsage = await runQuery(`INSERT INTO referral_uses (referrer_id, referee_id, referral_code, accepted) VALUES (?, ?, ?, ?)`, [referrer.id, userId, referrer.referral_code, true])
    }

    try{
        sendMail({
            to: email,
            subject: "Welcome to Cartify🎉",
            template: "welcome.hbs",
            replacements: { fName, lName, username }
        })
    }
    catch(err){
        console.error("Failed to send welcome email:", err);
    }

    try{
        await this.assignReferralCode(userId)
    }
    catch(err){
        console.error("Failed to assign referral code:", err);
    }

    const addWallet = await runQuery(`INSERT INTO wallets (user_id) VALUES (?)`, [userId])
    // if(addWallet.affectedRows === 0){
    //     throw new Error ("Couldn't add wallet")
    // }

    const token = jwt.sign(
        {
            id: userId,
            username: username,
        },
        process.env.JWT_SECRET,
        { expiresIn: "10h" }
    );
    return token
}

exports.checkoutForm = async (addLine1, addLine2, city, email, fName, lName, pNumber, pincode, state, username) => {
    const result = await runQuery(
        "UPDATE users SET addLine1 = ?, addLine2 = ?, city = ?, email = ?, first_name = ?, last_name = ?, number = ?, pincode = ?, state = ? WHERE username = ?", 
        [addLine1, addLine2 ?? null, city, email, fName, lName ?? null, pNumber, pincode, state, username]);

    if (result.affectedRows === 0){
        throw new Error("Can't find record")
    }
}

exports.formData = async (userId) => {
    const formResult = await runQuery(`SELECT addLine1, addLine2, city, email, first_name, last_name, number, pincode, state FROM users WHERE id = ?`, [userId]);
    if (formResult.length === 0){
        throw new Error("Can't find record")
    }
    return formResult;
}

exports.sendInvite = async (userId, refereeEmail) => {
    const [getUser] = await runQuery(`SELECT * FROM users WHERE id = ?`, [userId])
    if(!getUser){
        throw new Error("Could not get referrer details")
    }

    const recordInvitation = await runQuery(`INSERT INTO referral_invites (referrer_id, referee_email, referral_code, status) VALUES (?, ?, ?, ?)`, [getUser.id, refereeEmail, getUser.referral_code, "sending"])
    if(recordInvitation.affectedRows === 0){
        throw new Error("Could not record invitation")
    }
    const invitationId = recordInvitation.insertId

    try{
        await sendMail({
            to: refereeEmail,
            subject: `${getUser.first_name} ${getUser.last_name} invites you to Cartify!`,
            template: "referral-invite.hbs",
            replacements: {fName: getUser.first_name, lName: getUser.last_name, inviteLink: `http://localhost:5173/signup?referral=${getUser.referral_code}`}
        })
    }
    catch(err){
        await runQuery(`UPDATE referral_invites SET status = ? WHERE id = ?`, ["failed", invitationId])
    }

    const updateInvitation = await runQuery(`UPDATE referral_invites SET status = ? WHERE id = ?`, ["sent", invitationId])
    if(updateInvitation.affectedRows === 0){
        throw new Error("Could not update invitation")
    }

    return invitationId
}

exports.generateReferralCode = (length = 6) => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let code = "";
    for (let i = 0; i < length; i++) {
        const rand = crypto.randomInt(0, chars.length);
        code += chars[rand];
    }
    return code;
}

exports.assignReferralCode = async (userId) => {
    let code;
    let success = false;
    let attempt = 1;

    while (!success && attempt <= 10) {
        console.log("assigning referral code attempt:", attempt);
        
        code = this.generateReferralCode(6);
        try {
            await runQuery("UPDATE users SET referral_code = ? WHERE id = ?", [code, userId]);
            success = true;
        } 
        catch (err) {
            if (err.code !== "ER_DUP_ENTRY") throw err;
            attempt += 1
        }
    }

    return code;
}

exports.referralsSummary = async (userId) => {

    let totalInvites = 0
    let pendingInvites = 0
    let totalReferrals = 0
    let totalRewards = 0

    const [getUser] = await runQuery(`SELECT * FROM users WHERE id = ?`, [userId])
    if(!getUser){
        throw new Error("Could not fetch User Details")
    }

    [{totalInvites}] = await runQuery(`SELECT COUNT(*) AS totalInvites FROM referral_invites WHERE referrer_id = ? AND status = ?`, [userId, "sent"]);

    const invites = await runQuery(`SELECT id FROM referral_invites WHERE referrer_id = ? AND status = ?`, [userId, "sent"]);
    const inviteIds = invites.map(item => item.id);

    // console.log(inviteIds);

    const invitesAccepted  = await runQuery(`SELECT id FROM referral_uses WHERE referral_invite_id IN (?)`, [inviteIds]);

    // console.log(invitesAccepted);
    pendingInvites = totalInvites - invitesAccepted.length;

    [{totalReferrals}] = await runQuery(`SELECT COUNT(*) AS totalReferrals FROM referral_uses WHERE referrer_id = ? AND accepted = ?`, [userId, true]);

    [{totalRewards}] = await runQuery(`SELECT COALESCE(SUM(reward_amount), 0) AS totalRewards FROM referral_uses WHERE referrer_id = ? AND accepted = ? AND reward_status = ?`, [userId, true, "credited"]);

    // console.log(totalInvites, totalReferrals, totalRewards, getUser.referral_code);
    return {totalInvites, totalReferrals, totalRewards, pendingInvites, myReferralCode: getUser.referral_code}
}

exports.acceptedReferrals = async (userId) => {
    const referrals = await runQuery(`SELECT 
                                        ru.id,
                                        ru.referrer_id,
                                        ru.referee_id,
                                        ru.referral_code,
                                        ru.reward_status,
                                        ru.reward_amount,
                                        ru.created_at,
                                        ru.updated_at,
                                        ru.referral_invite_id,
                                        u.first_name,
                                        u.last_name,
                                        u.email
                                    FROM referral_uses ru
                                    JOIN users u
                                        ON ru.referee_id = u.id
                                    WHERE referrer_id = ?
                                    ORDER BY ru.created_at DESC`, [userId])

    return referrals
}

exports.allInvites = async (userId) => {
    const invites = await runQuery(`SELECT 
                                        ri.id,
                                        ri.referee_email,
                                        ri.referral_code,
                                        ri.status,
                                        ri.created_at,
                                        ri.updated_at,
                                        ru.accepted
                                    FROM referral_invites ri
                                    LEFT JOIN referral_uses ru
                                        ON ri.id = ru.referral_invite_id
                                    WHERE ri.referrer_id = ?
                                    ORDER BY ri.created_at DESC`, [userId])

    return invites
}