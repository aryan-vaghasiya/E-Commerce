const walletService = require("../services/walletService")

exports.getUserWallet = async (req, res) => {
    const userId = req.user.id;
    try{
        const wallet = await walletService.getWallet(userId)
        return res.status(200).json(wallet)
    }
    catch(err){
        console.error("Error fetching wallet wallet: ", err.message);
        res.status(500).json({ error: err.message });
    }
}

exports.addBalance = async (req, res) => {
    const userId = req.user.id;
    const {amount} = req.body

    try{
        const wallet = await walletService.getWallet(userId)
        await walletService.addAmount(wallet, amount, "DEPOSIT")
        return res.status(200).send("Successfully added funds");
    }
    catch(err){
        console.error("Error adding funds in wallet: ", err.message);
        res.status(500).json({ error: err.message });
    }
}

exports.withdrawBalance = async (req, res) => {
    const userId = req.user.id;
    const {amount} = req.body

    try{
        const wallet = await walletService.getWallet(userId)
        await walletService.withdrawAmount(wallet, amount, "WITHDRAWAL")
        return res.status(200).send("Successful withdrawal");
    }
    catch(err){
        console.error("Error withdrawing funds from wallet: ", err.message);
        res.status(500).json({ error: err.message });
    }
}

exports.getWalletTransactions = async (req, res) => {
    const userId = req.user.id;
    try{
        const wallet = await walletService.getWallet(userId)
        const transactions = await walletService.getTransactions(wallet)
        return res.status(200).json(transactions)
    }
    catch(err){
        console.error("Error fetching wallet transactions: ", err.message);
        res.status(500).json({ error: err.message });
    }
}

exports.verifyWalletBalance = async (req, res) => {
    const userId = req.user.id

    try{
        const wallet = await walletService.getWallet(userId)
        await walletService.verifyBalance(wallet)
        return res.status(200).send("Balance verification Successful");
    }
    catch(err){
        console.error("Error verifying wallet balance: ", err.message);
        res.status(500).json({ error: err.message });
    }
}

exports.compareWalletBalance = async (req, res) => {
    const userId = req.user.id
    const amount = req.query.amount

    try{
        const wallet = await walletService.getWallet(userId)
        const canAfford = await walletService.compareBalance(wallet, amount)        
        return res.status(200).json(canAfford);
    }
    catch(err){
        console.error("Error comparing wallet balance: ", err.message);
        res.status(500).json({ error: err.message });
    }
}