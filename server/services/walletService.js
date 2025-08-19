const runQuery = require("../db");

exports.getWallet = async (userId) => {
    const wallet = await runQuery(`SELECT * FROM wallets WHERE user_id = ?`, [userId])
    console.log(wallet);
    return wallet
}