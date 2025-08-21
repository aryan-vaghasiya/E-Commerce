const runQuery = require("../db");

exports.getWallet = async (userId) => {
    const [wallet] = await runQuery(`SELECT * FROM wallets WHERE user_id = ?`, [userId])
    if(!wallet){
        throw new Error("Could not find wallet")
    }
    return wallet
}

exports.addAmount = async (wallet, amount, type) => {
    const walletId = wallet.id
    const userId = wallet.user_id

    const isVerified = await this.verifyBalance(wallet);
    if (!isVerified) {
        throw new Error("Wallet balance mismatch");
    }

    const updateBalance = await runQuery(`UPDATE wallets SET balance = balance + ? WHERE user_id = ?`,[amount, userId])
    if(updateBalance.affectedRows === 0){
        throw new Error("Could not update balance")
    }

    const addTransaction = await runQuery(`INSERT INTO wallet_transactions (wallet_id, amount, transaction, type) VALUES (?, ?, ?, ?)`, [walletId, amount, 'CREDIT', type])
    if(addTransaction.affectedRows === 0){
        throw new Error("Could not record transaction")
    }
}

exports.withdrawAmount = async (wallet, amount, type) => {
    const walletId = wallet.id
    const userId = wallet.user_id
    const currentBalance = wallet.balance

    if(currentBalance < parseFloat(amount)){
        throw new Error("Balance is less than withdrawal amount")
    }

    const isVerified = await this.verifyBalance(wallet);
    if (!isVerified) {
        throw new Error("Wallet balance mismatch");
    }

    const updateBalance = await runQuery(`UPDATE wallets SET balance = balance - ? WHERE user_id = ?`,[amount, userId])
    if(updateBalance.affectedRows === 0){
        throw new Error("Could not update balance")
    }

    const addTransaction = await runQuery(`INSERT INTO wallet_transactions (wallet_id, amount, transaction, type) VALUES (?, ?, ?, ?)`, [walletId, amount, 'DEBIT', type])
    if(addTransaction.affectedRows === 0){
        throw new Error("Could not record transaction")
    }
}

exports.getTransactions = async (wallet) => {
    const walletId = wallet.id

    let transactions = []
    transactions = await runQuery(`SELECT * 
                                    FROM wallet_transactions 
                                    WHERE wallet_id = ? 
                                    ORDER BY created_at DESC 
                                    LIMIT 10`, [walletId]);
    return transactions
}

exports.verifyBalance = async (wallet) =>{
    const walletId = wallet.id
    const cacheBalance = wallet.balance

    const [{calculated_balance}] = await runQuery(`SELECT
                                                    SUM(CASE WHEN transaction = 'CREDIT' THEN amount ELSE 0 END) -
                                                    SUM(CASE WHEN transaction = 'DEBIT' THEN amount ELSE 0 END) AS calculated_balance
                                                FROM wallet_transactions
                                                WHERE wallet_id = ?`, [walletId]);

    return calculated_balance === cacheBalance
}

exports.compareBalance = async (wallet, amount) => {
    const isVerified = await this.verifyBalance(wallet);
    if (!isVerified) {
        throw new Error("Wallet balance mismatch");
    }

    return wallet.balance >= parseFloat(amount);
}