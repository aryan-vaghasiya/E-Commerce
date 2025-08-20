const walletService = require("../services/walletService")

exports.getUserWallet = async (req, res) => {
    const userId = req.user.id;
    try{
        const balance = await walletService.getWallet(userId)
        return res.status(200).json(balance)
    }
    catch(err){
        console.error("Error fetching wallet balance: ", err.message);
        res.status(500).json({ error: err.message });
    }
}

exports.addBalance = async (req, res) => {
    const userId = req.user.id;
    const {amount} = req.body

    try{
        await walletService.addAmount(userId, amount)
        return res.status(200).send("Successfully added funds");
    }
    catch(err){
        console.error("Error adding funds in wallet: ", err.message);
        res.status(500).json({ error: err.message });
    }
}

exports.getWalletTransactions = async (req, res) => {
    const userId = req.user.id;
    try{
        const transactions = await walletService.getTransactions(userId)
        return res.status(200).json(transactions)
    }
    catch(err){
        console.error("Error fetching wallet transactions: ", err.message);
        res.status(500).json({ error: err.message });
    }
}

exports.withdrawBalance = async (req, res) => {
    const userId = req.user.id;
    const {amount} = req.body

    try{
        await walletService.withdrawAmount(userId, amount)
        return res.status(200).send("Successful withdrawal");
    }
    catch(err){
        console.error("Error withdrawing funds from wallet: ", err.message);
        res.status(500).json({ error: err.message });
    }
}