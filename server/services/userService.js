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

    const getUser = await runQuery("SELECT * FROM users WHERE username = ?", [username])
    if (getUser.length > 0) {
        throw new Error ("User already Exists, Please Login")
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

exports.generateReferral = async (userId) => {
    const [getUser] = await runQuery(`SELECT * FROM users WHERE id = ?`, [userId])

    if(!getUser){
        throw new Error("Could not generate referral")
    }

    const token = jwt.sign(
        {
            id: userId,
            email: getUser.email
        },
        process.env.JWT_SECRET_REFERRAL,
        { expiresIn: "8d" }
    );

    console.log(token);
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

exports.acceptReferralInvitation = async () => {

}