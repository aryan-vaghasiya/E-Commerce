const runQuery = require("../db")
const jwt = require("jsonwebtoken");
const secretKey = "abcde12345";
const bcrypt = require("bcrypt")

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
            secretKey,
            { expiresIn: "10h" }
        );
        return token
    }
    else {
        throw new Error("Wrong Password")
    }
}

exports.signupUser = async(username, password, fName, lName, email) => {
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

    const addWallet = await runQuery(`INSERT INTO wallets (user_id, balance) VALUES (?, ?)`, [userId, 0.00])
    if(addWallet.affectedRows === 0){
        throw new Error ("Couldn't add wallet")
    }

    const token = jwt.sign(
        {
            id: userId,
            username: username,
        },
        secretKey,
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