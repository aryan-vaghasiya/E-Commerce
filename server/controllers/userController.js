const userService = require("../services/userService")

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try{
        const token = await userService.loginUser(username, password);
        res.status(200).json({ message: "Login Successful", token: token});
    }
    catch (err){
        console.error("Error Logging in: ", err.message);
        res.status(500).json({ error: err.message });
    }
}

exports.signup = async (req, res) => {
    const { username, password, fName, lName, email, referral, referralMode } = req.body;
    console.log(username, password, fName, lName, email, referral, referralMode);

    try{
        const token = await userService.signupUser(username, password, fName, lName, email, referral, referralMode);
        res.status(200).json({ message: "Signup Successful", token: token});
    }
    catch (err){
        console.error("Error Signing Up: ", err.message);
        res.status(500).json({ error: err.message });
    }
}

exports.checkout = async (req, res) => {
    const {addLine1, addLine2, city, email, fName, lName, pNumber, pincode, state, username} = req.body;

    try{
        await userService.checkoutForm(addLine1, addLine2, city, email, fName, lName, pNumber, pincode, state, username);
        return res.status(200).send("Form Insert Successful");
    }
    catch(err){
        console.error("Error Adding checkout form: ", err.message);
        res.status(500).json({ error: err.message });
    }
}

exports.getForm = async (req, res) => {
    const userId = req.user.id;

    try{
        const formData = await userService.formData(userId);
        return res.status(200).json(formData)
    }
    catch(err){
        console.error("Error fetching form: ", err.message);
        res.status(500).json({ error: err.message });
    }
}

exports.makeReferralToken = async (req, res) => {
    const userId = req.user.id;

    try{
        const referralToken = await userService.generateReferral(userId);
        return res.status(200).json(referralToken)
    }
    catch(err){
        console.error("Error generating referral: ", err.message);
        res.status(500).json({ error: err.message });
    }
}

exports.sendReferralInvite = async (req, res) => {
    const userId = req.user.id;
    const refereeEmail = req.body.email

    try{
        const invitation = await userService.sendInvite(userId, refereeEmail);
        return res.status(200).json(invitation)
    }
    catch(err){
        console.error("Error sending referral invitation: ", err.message);
        res.status(500).json({ error: err.message });
    }
}

exports.getReferralsSummary = async (req, res) => {
    const userId = req.user.id;

    try{
        const summary = await userService.referralsSummary(userId);
        return res.status(200).json(summary)
    }
    catch(err){
        console.error("Error fetching referral summary: ", err.message);
        res.status(500).json({ error: err.message });
    }
}

exports.getAcceptedReferrals = async (req, res) => {
    const userId = req.user.id;

    try{
        const referrals = await userService.acceptedReferrals(userId);
        return res.status(200).json(referrals)
    }
    catch(err){
        console.error("Error fetching referrals: ", err.message);
        res.status(500).json({ error: err.message });
    }
}

exports.getReferralInvites = async (req, res) => {
    const userId = req.user.id;

    try{
        const invitations = await userService.allInvites(userId);
        return res.status(200).json(invitations)
    }
    catch(err){
        console.error("Error fetching invitations: ", err.message);
        res.status(500).json({ error: err.message });
    }
}

