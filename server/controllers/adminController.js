const adminServices = require("../services/adminServices")

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try{
        const token = await adminServices.loginAdmin(username, password);
        res.status(200).json({ message: "Admin Login Successful", token: token});
    }
    catch (err){
        console.error("Error Logging in: ", err.message);
        res.status(500).json({ error: err.message });
    }
}

exports.getDashboard = async (req, res) => {
    try{
        const data = await adminServices.getDashboard();
        res.status(200).json(data);
    }
    catch(err){
        console.error("Error fetching Dashboard: ", err.message);
        res.status(500).json({ error: err.message });
    }
}

exports.getOrders = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit);
    const offset = (page - 1) * limit
    // console.log(page, limit, offset);

    try{
        const allOrders = await adminServices.getAllOrders(page, limit, offset)
        res.status(200).json(allOrders);
    }
    catch (err){
        console.error("Error fetching all orders: ", err.message);
        res.status(500).json({ error: err.message });
    }
}

exports.acceptOrders = async (req, res) => {
    const {id} = req.body
    // console.log(id);
    
    try{
        const data = await adminServices.setAcceptOrders(id);
        res.status(200).json(data);
    }
    catch(err){
        console.error("Error accepting Orders: ", err.message);
        res.status(500).json({ error: err.message });
    }
}