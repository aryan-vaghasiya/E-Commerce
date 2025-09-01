import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { Page, Text, View, Document, StyleSheet, pdf } from '@react-pdf/renderer';
import dayjs from 'dayjs';
import { saveAs } from 'file-saver';
import { useState } from 'react';

// const styles = StyleSheet.create({
//     table: {
//         width: '100%',
//     },
//     row: {
//         display: 'flex',
//         flexDirection: 'row',
//         borderTop: '1px solid #EEE',
//         paddingTop: 8,
//         paddingBottom: 8,
//     },
//     header: {
//         borderTop: 'none',
//     },
//     bold: {
//         fontWeight: 'bold',
//     },

//     col1: {
//         width: '10%',
//     },
//     col2: {
//         width: '30%',
//         paddingHorizontal: "5px"
//     },
//     col3: {
//         width: '30%',
//     },
//     col4: {
//         width: '30%',
//     },
//     textRight: {
//         textAlign: "right"
//     }
// })

const tableStyles = StyleSheet.create({
    table: {
        display: "table",
        width: "auto",
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: "#bfbfbf",
        marginBottom: 10,
    },
    tableRow: {
        flexDirection: "row",
    },
    tableColHeader: {
        flex: 1,
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: "#bfbfbf",
        backgroundColor: "#f0f0f0",
        padding: 5,
        fontSize: 10,
        fontWeight: "bold",
        textAlign: "center",
    },
    tableCol: {
        flex: 1,
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: "#bfbfbf",
        padding: 5,
        fontSize: 10,
        textAlign: "center",
    },
    tableColLeft: {
        flex: 1,
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: "#bfbfbf",
        padding: 5,
        fontSize: 10,
        textAlign: "left",
    },
    tableColRight: {
        flex: 1,
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: "#bfbfbf",
        padding: 5,
        fontSize: 10,
        textAlign: "right",
    },
    bold: {
        fontWeight: "bold",
    },
});

const styles = StyleSheet.create({
    section: { marginTop: 8, padding: 10, paddingBottom: 0 },
    header: { fontSize: 16, fontWeight: "bold", marginVertical: 6, borderBottom: "1pt solid #000", paddingBottom: 4 },
    label: { fontWeight: "bold", fontSize: 12 },
    row: { marginVertical: 2, fontSize: 12 },
    divider: { borderBottom: "1pt solid #000", marginVertical: 6 },
});

// const tableStyles = StyleSheet.create({
//     // wrapper around the whole table
//     table: {
//         display: "table",
//         width: "auto",
//         borderStyle: "solid",
//         borderWidth: 1,
//         borderRightWidth: 0,
//         borderBottomWidth: 0,
//         marginVertical: 10,
//     },

//     // single row
//     tableRow: {
//         flexDirection: "row",
//     },

//     // header row
//     tableHeader: {
//         backgroundColor: "#f2f2f2",
//     },

//     // cell (base)
//     tableCell: {
//         borderStyle: "solid",
//         borderWidth: 1,
//         borderLeftWidth: 0,
//         borderTopWidth: 0,
//         padding: 4,
//         fontSize: 10,
//         flexGrow: 1, // default cell expands equally
//         textAlign: "center",
//     },

//     // left aligned (e.g. product/category name)
//     tableCellLeft: {
//         textAlign: "left",
//     },

//     // bold cell
//     tableCellBold: {
//         fontWeight: "bold",
//     },

//     // header cell text
//     headerText: {
//         fontSize: 11,
//         fontWeight: "bold",
//     },
// });

const UsersTable = ({ users }) => (
    <View style={{padding: 5}}>
        <View style={tableStyles.table}>
            <View style={tableStyles.tableRow}>
                <Text style={tableStyles.tableColHeader}>User ID</Text>
                <Text style={tableStyles.tableColHeader}>Times Used</Text>
                <Text style={tableStyles.tableColHeader}>Total Discount</Text>
                <Text style={tableStyles.tableColHeader}>Total Sales</Text>
            </View>

            {users.users.map((row) => (
                <View style={tableStyles.tableRow} key={row.user_id}>
                    <Text style={tableStyles.tableColRight}>{row.user_id}</Text>
                    <Text style={tableStyles.tableColRight}>{row.total_redeems}</Text>
                    <Text style={tableStyles.tableColRight}>${row.total_discount.toFixed(2)}</Text>
                    <Text style={tableStyles.tableColRight}>${row.total_sales.toFixed(2)}</Text>
                </View>
            ))}

            <View style={tableStyles.tableRow}>
                <Text style={[tableStyles.tableCol, tableStyles.bold]}>Total</Text>
                <Text style={[tableStyles.tableColRight, tableStyles.bold]}>{users.totalUserRedeems}</Text>
                <Text style={[tableStyles.tableColRight, tableStyles.bold]}>${users.totalUserDiscount.toFixed(2)}</Text>
                <Text style={[tableStyles.tableColRight, tableStyles.bold]}>${users.totalUserSales.toFixed(2)}</Text>
            </View>
        </View>
    </View>
);

const ProductsTable = ({ products }) => (
    <View style={{padding: 5}}>
        <View style={tableStyles.table}>
            <View style={tableStyles.tableRow}>
                {/* <Text style={tableStyles.tableColHeader}>Sr. No.</Text> */}
                <Text style={[tableStyles.tableColHeader, {maxWidth: "15%"}]}>Product ID</Text>
                <Text style={[tableStyles.tableColHeader, {minWidth: "20%"}]}>Name</Text>
                <Text style={[tableStyles.tableColHeader, {maxWidth: "15%"}]}>Units Sold</Text>
                <Text style={tableStyles.tableColHeader}>Discount Given</Text>
                <Text style={tableStyles.tableColHeader}>Total Sales</Text>
            </View>

            {products.products.map((row, index) => (
            <View style={tableStyles.tableRow} key={row.id}>
                {/* <Text style={tableStyles.tableColRight}>{index + 1}</Text> */}
                <Text style={[tableStyles.tableColRight, {maxWidth: "15%"}]}>{row.id}</Text>
                <Text style={[tableStyles.tableColLeft, {minWidth: "20%"}]}>{row.title}</Text>
                <Text style={[tableStyles.tableColRight, {maxWidth: "15%"}]}>{row.total_quantity}</Text>
                <Text style={tableStyles.tableColRight}>${row.total_product_discount.toFixed(2)}</Text>
                <Text style={tableStyles.tableColRight}>${row.total_purchase_price.toFixed(2)}</Text>
            </View>
            ))}

            <View style={tableStyles.tableRow}>
                <Text style={[tableStyles.tableCol, tableStyles.bold, {maxWidth: "15%"}]}>Total</Text>
                <Text style={[tableStyles.tableCol, tableStyles.bold, {minWidth: "20%"}]}></Text>
                {/* <Text style={[tableStyles.tableCol, tableStyles.bold]}></Text> */}
                <Text style={[tableStyles.tableColRight, tableStyles.bold, {maxWidth: "15%"}]}>{products.totalProductsSold}</Text>
                <Text style={[tableStyles.tableColRight, tableStyles.bold]}>${products.totalProductsDiscounts.toFixed(2)}</Text>
                <Text style={[tableStyles.tableColRight, tableStyles.bold]}>${products.totalProductsSales.toFixed(2)}</Text>
            </View>
        </View>
    </View>
);

const CategoriesTable = ({ categories }) => (
    <View style={{padding: 5}}>
        <View style={tableStyles.table}>
            <View style={tableStyles.tableRow}>
                <Text style={[tableStyles.tableColHeader, {maxWidth: "15%"}]}>Category ID</Text>
                <Text style={[tableStyles.tableColHeader, {minWidth: "20%"}]}>Category</Text>
                <Text style={[tableStyles.tableColHeader, {maxWidth: "15%"}]}>Units Sold</Text>
                <Text style={tableStyles.tableColHeader}>Discount Given</Text>
                <Text style={tableStyles.tableColHeader}>Total Sales</Text>
            </View>

            {categories.categories.map((row) => (
            <View style={tableStyles.tableRow} key={row.id}>
                <Text style={[tableStyles.tableColRight, {maxWidth: "15%"}]}>{row.id}</Text>
                <Text style={[tableStyles.tableColLeft, {minWidth: "20%"}]}>{row.category}</Text>
                <Text style={[tableStyles.tableColRight, {maxWidth: "15%"}]}>{row.total_quantity}</Text>
                <Text style={tableStyles.tableColRight}>${row.total_product_discount.toFixed(2)}</Text>
                <Text style={tableStyles.tableColRight}>${row.total_purchase_price.toFixed(2)}</Text>
            </View>
            ))}

            <View style={tableStyles.tableRow}>
                <Text style={[tableStyles.tableCol, tableStyles.bold, {maxWidth: "15%"}]}>Total</Text>
                <Text style={[tableStyles.tableCol, tableStyles.bold, {minWidth: "20%"}]}></Text>
                <Text style={[tableStyles.tableColRight, tableStyles.bold, {maxWidth: "15%"}]}>{categories.totalCategoryProductsSold}</Text>
                <Text style={[tableStyles.tableColRight, tableStyles.bold]}>${categories.totalCategoryProductsDiscounts.toFixed(2)}</Text>
                <Text style={[tableStyles.tableColRight, tableStyles.bold]}>${categories.totalCategoryProductsSales.toFixed(2)}</Text>
            </View>
        </View>
    </View>
);

const DatesTable = ({ dates }) => (
    <View style={{padding: 5}}>
        <View style={[tableStyles.table, {width: "45%"}]}>
            <View style={tableStyles.tableRow}>
                <Text style={tableStyles.tableColHeader}>Date</Text>
                <Text style={[tableStyles.tableColHeader, , {maxWidth: "35%"}]}>Times Used</Text>
            </View>

            {dates.dates.map((row, index) => (
                <View style={tableStyles.tableRow} key={row.id}>
                    <Text style={tableStyles.tableCol}>{dayjs(row.date).format("DD MMM YYYY")}</Text>
                    <Text style={[tableStyles.tableColRight, {maxWidth: "35%"}]}>{row.total_redeems}</Text>
                </View>
            ))}

            <View style={tableStyles.tableRow}>
                <Text style={[tableStyles.tableCol, tableStyles.bold]}>Total</Text>
                <Text style={[tableStyles.tableColRight, tableStyles.bold, {maxWidth: "35%"}]}>{dates.totalDateRedeems}</Text>
            </View>
        </View>
    </View>
);

function CouponReportPDF({data}) {
    const [products, setProducts] = useState(data.products)
    const [categories, setCategories] = useState(data.categories)
    const [users, setUsers] = useState(data.users)
    const [dates, setDates] = useState(data.dates)
    const [couponData, setCouponData] = useState(data.couponData)
    const [report, setReport] = useState(data.report)
    return (
        <Document>
            <Page>
                <View style={styles.section}>
                    <Text style={styles.header}>Coupon Details</Text>
                    <Text style={styles.row}>
                        <Text style={styles.label}>Name: </Text>{couponData.name}
                    </Text>
                    <Text style={styles.row}>
                        <Text style={styles.label}>Code: </Text>{couponData.code}
                    </Text>
                    <Text style={styles.row}>
                        <Text style={styles.label}>Discount: </Text>
                        {couponData.discount_type === "percent" 
                            ? `${couponData.discount_value}%`
                            : `$${couponData.discount_value.toFixed(2)}`
                        }
                        {couponData.threshold_amount ? ` (upto $${couponData.threshold_amount})` : ""}
                    </Text>
                    <Text style={styles.row}>
                        <Text style={styles.label}>Applicable on: </Text>
                        {couponData.applies_to === "all" ? "Cart" :
                        couponData.applies_to === "product" ? "Product(s)" : "Categories"}
                    </Text>
                    <Text style={styles.row}>
                        <Text style={styles.label}>Min. Cart Value: </Text>
                        {couponData.min_cart_value ? `$${couponData.min_cart_value.toFixed(2)}` : "No minimum value needed"}
                    </Text>
                    <Text style={styles.row}>
                        <Text style={styles.label}>Limit per user: </Text>
                        {couponData.limit_per_user ?? "Unlimited"}
                    </Text>
                    <Text style={styles.row}>
                        <Text style={styles.label}>Total Coupons: </Text>
                        {couponData.total_coupons ?? "Unlimited"}
                        {couponData.coupons_left ? ` (${couponData.coupons_left} left)` : ""}
                    </Text>
                    <Text style={styles.row}>
                        <Text style={styles.label}>Validity: </Text>
                        {dayjs(couponData.start_time).format("DD MMM YYYY")} - {dayjs(couponData.end_time).format("DD MMM YYYY")}
                    </Text>
                </View>

                {report && report.totalUsage > 0 &&
                <View style={styles.section}>
                    <Text style={{ marginVertical: 6, borderBottom: "1pt solid #000", paddingBottom: 4 }}>
                        <Text style={styles.row}>
                            <Text style={styles.header}>Coupon Report </Text>
                            ({dayjs(report.fromTime).format("DD MMM YYYY, hh:mm A")} - {dayjs(report.toTime).format("DD MMM YYYY, hh:mm A")})
                        </Text>
                    </Text>
                    <Text style={styles.row}><Text style={styles.label}>Total Redeems: </Text>{report.totalUsage}</Text>
                    <Text style={styles.row}><Text style={styles.label}>Unique Users: </Text>{report.totalUniqueUsers}</Text>
                    <Text style={styles.row}><Text style={styles.label}>Discounts Given: </Text>${report.totalLoss.toFixed(2)}</Text>

                    {couponData.applies_to !== "all" ?
                    <>
                        <Text style={styles.row}><Text style={styles.label}>Total Revenue (Discount-Applicable): </Text>${report.totalSales.toFixed(2)}</Text>
                        <Text style={styles.row}><Text style={styles.label}>Average Order Value (Discount-Applicable): </Text>${report.targetedAOV.toFixed(2)}</Text>
                        <Text style={styles.row}><Text style={styles.label}>Total Revenue (Gross): </Text>${report.totalGrossSales.toFixed(2)}</Text>
                        <Text style={styles.row}><Text style={styles.label}>Average Order Value (Gross): </Text>${report.grossAOV.toFixed(2)}</Text>
                    </>
                    :
                    <>
                        <Text style={styles.row}><Text style={styles.label}>Total Revenue: </Text>${report.totalGrossSales.toFixed(2)}</Text>
                        <Text style={styles.row}><Text style={styles.label}>Average Order Value: </Text>${report.grossAOV.toFixed(2)}</Text>
                    </>
                    }
                </View>
                }

                {
                    products && products.products.length > 0 ?
                    <View style={styles.section} wrap={false}>
                        <Text style={styles.header}>Product-wise Usage</Text>
                        <ProductsTable products={products} />
                    </View>
                    :null
                }
                {
                    categories && categories.categories.length > 0 ?
                    <View style={styles.section} wrap={false}>
                        <Text style={styles.header}>Category-wise Usage</Text>
                        <CategoriesTable categories={categories} />
                    </View>
                    :null
                }
                {
                    users && users.users.length > 0 ?
                    <View style={styles.section} wrap={false}>
                        <Text style={styles.header}>User-wise Usage</Text>
                        <UsersTable users={users} />
                    </View>
                    :
                    null
                } 
                {
                    dates && dates.dates.length > 0 ?
                    <View style={styles.section} wrap={false}>
                        <Text style={styles.header}>Date-wise Usage</Text>
                        <DatesTable dates={dates} />
                    </View>
                    :
                    null
                }
            </Page>
        </Document>
    )
}

export default CouponReportPDF
