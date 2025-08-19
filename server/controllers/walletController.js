const walletService = require("../services/walletService")

exports.getMyWallet = async (req, res) => {
    const userId = req.user.id;
    try{
        const wallet = await walletService.getWallet(userId)
        return res.status(200).json(wallet)
    }
    catch(err){
        console.error("Error fetching wallet: ", err.message);
        res.status(500).json({ error: err.message });
    }
}