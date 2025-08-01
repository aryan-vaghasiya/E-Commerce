// const bcrypt = require("bcrypt");

// (async () => {
//     const hash = await bcrypt.hash("admin", 10);
//     console.log("Pass:", hash);
// })();



// const tenYearsLater = new Date();
// tenYearsLater.setFullYear(tenYearsLater.getFullYear() + 10);

// console.log(tenYearsLater)

// const date = new Date()
// console.log(date.getUTCMonth())
// console.log(new Date().toISOString().slice(0, 19).replace('T', ' '))
// console.log(new Date().toISOString().slice(0, 19)+"-05:30")


// const localTime = new Date(new Date().toISOString().slice(0, 19)+"-05:30")
// const currentTime = localTime.toISOString().slice(0, 19).replace('T', ' ')
// const tenYearsLater = (parseInt(localTime.toISOString().slice(0,4)) + 10)+ localTime.toISOString().slice(4, 19).replace('T', ' ')

// let products = {}

// const fetchCouponUsages = async (page, limit) => {
//     // setLoadingUsages(true)
//     try{
//         const response = await fetch(`https://dummyjson.com/products`)

//         if(!response.ok){
//             const error = await response.json()
//             setLoadingProducts(false)
//             return console.log(error)
//         }
//         const result = await response.json()
//         console.log(result);
//         products = result
//         // setUsages(result.usages)
//         // setTotalUsages(result.totalUsages)
//         // setLoadingUsages(false)
//     }
//     catch(err){
//         console.error(err.message)
//     }
// }