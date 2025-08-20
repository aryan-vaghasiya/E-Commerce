const runQuery = require("../db");

exports.getWallet = async (userId) => {
    const [wallet] = await runQuery(`SELECT * FROM wallets WHERE user_id = ?`, [userId])
    if(!wallet){
        throw new Error("Could not find wallet")
    }
    return wallet
}

exports.addAmount = async (userId, amount) => {
    const userWallet = await this.getWallet(userId)
    const walletId = userWallet.id

    const updateBalance = await runQuery(`UPDATE wallets SET balance = balance + ? WHERE user_id = ?`,[amount, userId])

    if(updateBalance.affectedRows === 0){
        throw new Error("Could not update balance")
    }

    const addTransaction = await runQuery(`INSERT INTO wallet_transactions (wallet_id, amount, transaction, type) VALUES (?, ?, ?, ?)`, [walletId, amount, 'CREDIT', 'DEPOSIT'])

    if(addTransaction.affectedRows === 0){
        throw new Error("Could not add funds entry")
    }

    const [{calculated_balance}] = await runQuery(`SELECT 
                                                    SUM(CASE WHEN transaction = 'CREDIT' THEN amount ELSE 0 END) -
                                                    SUM(CASE WHEN transaction = 'DEBIT' THEN amount ELSE 0 END) AS calculated_balance
                                                FROM wallet_transactions
                                                WHERE wallet_id = ?`, [walletId]);

    const [{newBalance}] = await runQuery(`SELECT balance AS newBalance FROM wallets WHERE id = ? AND user_id = ?`,[walletId, userId])

    // console.log(calculated_balance, newBalance);

    if(calculated_balance !== newBalance){
        throw new Error("Balance mismatch in Wallet")
    }
}

exports.getTransactions = async (userId) => {
    const userWallet = await this.getWallet(userId)
    const walletId = userWallet.id

    let transactions = []
    transactions = await runQuery(`SELECT * FROM wallet_transactions WHERE wallet_id = ? ORDER BY created_at DESC LIMIT 10`, [walletId])
    return transactions
}

exports.withdrawAmount = async (userId, amount) => {
    const userWallet = await this.getWallet(userId)
    const walletId = userWallet.id
    const currentBalance = userWallet.balance

    // console.log(currentBalance, parseFloat(amount));
    if(currentBalance < parseFloat(amount)){
        throw new Error("Balance is less than withdrawal amount")
    }

    const updateBalance = await runQuery(`UPDATE wallets SET balance = balance - ? WHERE user_id = ?`,[amount, userId])

    if(updateBalance.affectedRows === 0){
        throw new Error("Could not update balance")
    }

    const addTransaction = await runQuery(`INSERT INTO wallet_transactions (wallet_id, amount, transaction, type) VALUES (?, ?, ?, ?)`, [walletId, amount, 'DEBIT', 'WITHDRAWAL'])

    if(addTransaction.affectedRows === 0){
        throw new Error("Could not add funds entry")
    }

    const [{calculated_balance}] = await runQuery(`SELECT 
                                                    SUM(CASE WHEN transaction = 'CREDIT' THEN amount ELSE 0 END) -
                                                    SUM(CASE WHEN transaction = 'DEBIT' THEN amount ELSE 0 END) AS calculated_balance
                                                FROM wallet_transactions
                                                WHERE wallet_id = ?`, [walletId]);

    const [{newBalance}] = await runQuery(`SELECT balance AS newBalance FROM wallets WHERE id = ? AND user_id = ?`,[walletId, userId])

    // console.log(calculated_balance, newBalance);
    if(calculated_balance !== newBalance){
        throw new Error("Balance mismatch in Wallet")
    }
}