import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Image,
    Font
} from '@react-pdf/renderer'
import dayjs from 'dayjs'
import cartifyLogo from "../assets/cartify-logo.png"

const styles = StyleSheet.create({
    image: {
        height: "auto",
        width: "100px",
        objectFit: "contain"
    },
    page: {
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        padding: 30,
        fontSize: 10,
        fontFamily: 'Helvetica'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 30,
        paddingBottom: 15,
        borderBottom: 2,
        borderBottomColor: '#2196F3'
    },
    companyInfo: {
        flex: 1
    },
    // companyName: {
    //     fontSize: 24,
    //     fontWeight: 'bold',
    //     color: '#2196F3',
    //     marginBottom: 5
    // },
    companyDetails: {
        fontSize: 10,
        color: '#666666',
        lineHeight: 1.4
    },
    invoiceInfo: {
        alignItems: 'flex-end'
    },
    invoiceTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 10
    },
    invoiceNumber: {
        fontSize: 12,
        color: '#666666',
        marginBottom: 3
    },
    // statusBadge: {
    //     backgroundColor: '#e3f2fd',
    //     padding: '4 8',
    //     borderRadius: 4,
    //     marginTop: 5
    // },
    // statusText: {
    //     fontSize: 8,
    //     color: '#1976d2',
    //     fontWeight: 'bold',
    //     textTransform: 'uppercase'
    // },
    customerSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30
    },
    customerInfo: {
        flex: 1,
        maxWidth: "45%"
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 8,
        borderBottom: 1,
        borderBottomColor: '#E0E0E0',
        paddingBottom: 3
    },
    customerText: {
        fontSize: 10,
        color: '#666666',
        lineHeight: 1.5,
        marginBottom: 2
    },
    orderInfo: {
        alignItems: 'flex-end'
    },
    table: {
        marginBottom: 30
    },
    // tableHeader: {
    //     flexDirection: 'row',
    //     backgroundColor: '#f5f5f5',
    //     padding: 8,
    //     fontWeight: 'bold',
    //     fontSize: 10,
    //     color: '#333333',
    //     borderBottom: 1,
    //     borderBottomColor: '#ddd'
    // },
    // tableRow: {
    //     flexDirection: 'row',
    //     // padding: 8,
    //     borderBottom: 1,
    //     borderBottomColor: '#f0f0f0',
    //     minHeight: 40,
    //     alignItems: 'center',
    //     border: "1px solid black",
    // },
    // tableRowEven: {
    //     backgroundColor: '#fafafa'
    // },
    // col1: { width: '8%', border: "1px solid black", display: "flex", alignItems: "center", justifyContent: "center", flex: 1},
    // col2: { width: '30%', marginRight: 10, border: "1px solid black" },
    // col3: { width: '11%', textAlign: 'center', border: "1px solid black"},
    // col4: { width: '10%', textAlign: 'center', border: "1px solid black"},
    // col5: { width: '15%', textAlign: 'center', border: "1px solid black"},
    // col6: { width: '11%', textAlign: 'center', border: "1px solid black"},
    // col7: { width: '15%', textAlign: 'center', border: "1px solid black"},
    // itemName: {
    //     fontSize: 10,
    //     fontWeight: 'bold',
    //     color: '#333333',
    //     marginBottom: 2
    // },
    // itemBrand: {
    //     fontSize: 8,
    //     color: '#888888'
    // },
    // itemRating: {
    //     fontSize: 8,
    //     color: '#FF8C00'
    // },
    // priceText: {
    //     fontSize: 10,
    //     color: '#333333',
    //     textAlign: 'right'
    // },
    // summary: {
    //     marginTop: 20,
    //     alignItems: 'flex-end'
    // },
    // summaryTable: {
    //     width: '40%',
    //     minWidth: 200
    // },
    // summaryRow: {
    //     flexDirection: 'row',
    //     justifyContent: 'space-between',
    //     paddingVertical: 4,
    //     paddingHorizontal: 8
    // },
    // summaryLabel: {
    //     fontSize: 10,
    //     color: '#666666'
    // },
    // summaryValue: {
    //     fontSize: 10,
    //     color: '#333333',
    //     fontWeight: 'bold'
    // },
    // totalRow: {
    //     flexDirection: 'row',
    //     justifyContent: 'space-between',
    //     paddingVertical: 8,
    //     paddingHorizontal: 8,
    //     // backgroundColor: '#2196F3',
    //     backgroundColor: 'grey',
    //     marginTop: 5
    // },
    // totalLabel: {
    //     fontSize: 12,
    //     color: '#ffffff',
    //     fontWeight: 'bold'
    // },
    // totalValue: {
    //     fontSize: 12,
    //     color: '#ffffff',
    //     fontWeight: 'bold'
    // },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        textAlign: 'center',
        borderTop: 1,
        borderTopColor: '#E0E0E0',
        paddingTop: 10
    },
    footerText: {
        fontSize: 8,
        color: '#888888',
        lineHeight: 1.4
    },
    // divider: {
    //     height: 1,
    //     backgroundColor: '#E0E0E0',
    //     marginVertical: 10
    // }
})

const tableStyles = StyleSheet.create({
    table: {
        display: "table",
        width: "auto",
        // borderStyle: "solid",
        // borderWidth: 1,
        // borderColor: "#bfbfbf",
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
    textLeft: {
        textAlign: "left"
    },
    textRight: {
        textAlign: "right"
    },
    bold: {
        fontWeight: "bold",
    },
}); 

const OrderInvoice = ({ orderData }) => {
    if (!orderData) return null

    const calculateUnitSubtotal = () => {
        return orderData.items.reduce((sum, item) => sum + item.selling_price, 0)
    }

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <View style={styles.companyInfo}>
                        {/* <View style={{display: "flex", justifyContent: "flex-start"}}> */}
                            {/* <Text style={styles.companyName}>Cartify</Text> */}
                            <Image style={styles.image} src={cartifyLogo} />
                        {/* </View> */}
                        <Text style={styles.companyDetails}>
                            Your Trusted E-commerce Partner{'\n'}
                            Phone: +91-1234567890{'\n'}
                            Email: support@cartify.com
                        </Text>
                    </View>
                    <View style={styles.invoiceInfo}>
                        <Text style={styles.invoiceTitle}>INVOICE</Text>
                        <Text style={styles.invoiceNumber}>Order #{orderData.order_id}</Text>
                        {/* <Text style={styles.invoiceNumber}>
                            Date: {dayjs(orderData.order_date).format('MMM DD, YYYY')}
                        </Text>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(orderData.status) + '20' }]}>
                            <Text style={[styles.statusText, { color: getStatusColor(orderData.status) }]}>
                                {orderData.status.toUpperCase()}
                            </Text>
                        </View> */}
                    </View>
                </View>

                <View style={styles.customerSection}>
                    <View style={styles.customerInfo}>
                        <Text style={styles.sectionTitle}>Bill To:</Text>
                        <Text style={styles.customerText}>
                            {orderData.user.first_name} {orderData.user.last_name}
                        </Text>
                        <Text style={styles.customerText}>
                            {orderData.user.email}
                        </Text>
                        <Text style={styles.customerText}>
                            {orderData.user.number}
                        </Text>
                    </View>
                    <View style={styles.customerInfo}>
                        <Text style={styles.sectionTitle}>Ship To:</Text>
                        <Text style={styles.customerText}>
                            {orderData.user.addLine1}
                        </Text>
                        <Text style={styles.customerText}>
                            {orderData.user.addLine2}
                        </Text>
                        <Text style={styles.customerText}>
                            {orderData.user.city}, {orderData.user.state} - {orderData.user.pincode}
                        </Text>
                    </View>
                    <View style={styles.orderInfo}>
                        <Text style={styles.sectionTitle}>Order Details:</Text>
                        <Text style={styles.customerText}>
                            Items: {orderData.items.length}
                        </Text>
                        <Text style={styles.customerText}>
                            Order Date: {dayjs(orderData.order_date).format("MMM DD, YYYY")}
                        </Text>
                        <Text style={styles.customerText}>
                            Delivered On: {dayjs(orderData.last_updated).format("MMM DD, YYYY")}
                        </Text>
                        {orderData.trackingNumber && (
                            <Text style={styles.customerText}>
                                Tracking: {orderData.trackingNumber}
                            </Text>
                        )}
                    </View>
                </View>

                <View style={tableStyles.table}>
                    <View style={tableStyles.tableRow}>
                        <Text style={[tableStyles.tableColHeader, {maxWidth: "8%"}]}>#</Text>
                        <Text style={[tableStyles.tableColHeader, {maxWidth: "30%"}]}>Title</Text>
                        <Text style={[tableStyles.tableColHeader, {maxWidth: "10%"}]}>Quantity</Text>
                        <Text style={[tableStyles.tableColHeader, , {maxWidth: "11%"}]}>Unit Price ($)</Text>
                        <Text style={[tableStyles.tableColHeader, {maxWidth: "14%"}]}>Gross Amount ($)</Text>
                        <Text style={[tableStyles.tableColHeader, {maxWidth: "13%"}]}>Discount ($)</Text>
                        <Text style={[tableStyles.tableColHeader, {maxWidth: "14%"}]}>Total ($)</Text>
                    </View>

                    {orderData.items.map((item, index) => (
                        <View key={item.id} style={[tableStyles.tableRow]} wrap={false}>
                            <Text style={[tableStyles.tableCol, {maxWidth: "8%"}]}>{index + 1}</Text>
                            <Text style={[tableStyles.tableCol, tableStyles.textLeft, {maxWidth: "30%"}]}>{item.title}</Text>
                            {/* <Text style={[tableStyles.tableCol, tableStyles.textLeft, {maxWidth: "30%"}]}>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</Text> */}
                            <Text style={[tableStyles.tableCol, tableStyles.textRight, {maxWidth: "10%"}]}>{item.quantity}</Text>
                            <Text style={[tableStyles.tableCol, tableStyles.textRight, {maxWidth: "11%"}]}>
                                {item.selling_price.toFixed(2)}
                            </Text>
                            <Text style={[tableStyles.tableCol, tableStyles.textRight, {maxWidth: "14%"}]}>{(item.selling_price * item.quantity).toFixed(2)}</Text>
                            <Text style={[tableStyles.tableCol, tableStyles.textRight, {maxWidth: "13%"}]}>
                                -{(item.discount_amount * item.quantity).toFixed(2)}
                            </Text>
                            <Text style={[tableStyles.tableCol, tableStyles.textRight, {maxWidth: "14%"}]}>
                                {(item.purchase_price * item.quantity).toFixed(2)}
                            </Text>
                        </View>
                    ))}

                    {orderData.coupon?.applies_to === "all" ?
                        <View style={[tableStyles.tableRow]} wrap={false}>
                            <Text style={[tableStyles.tableCol, {maxWidth: "8%"}]}></Text>
                            <Text style={[tableStyles.tableCol, tableStyles.textLeft, {maxWidth: "30%"}, { fontStyle: "italic" }]}>Coupon Discount ({orderData.coupon.code.toUpperCase()})</Text>
                            <Text style={[tableStyles.tableCol, tableStyles.textRight, {maxWidth: "10%"}]}>1</Text>
                            <Text style={[tableStyles.tableCol, tableStyles.textRight, {maxWidth: "11%"}]}>{orderData.discount_amount.toFixed(2)}</Text>
                            <Text style={[tableStyles.tableCol, tableStyles.textRight, {maxWidth: "14%"}]}>{orderData.discount_amount.toFixed(2)}</Text>
                            <Text style={[tableStyles.tableCol, tableStyles.textRight, {maxWidth: "13%"}]}>-{orderData.discount_amount.toFixed(2)}</Text>
                            <Text style={[tableStyles.tableCol, tableStyles.textRight, {maxWidth: "14%"}]}>-{orderData.discount_amount.toFixed(2)}</Text>
                        </View>
                        :
                        null
                    }

                    <View style={[tableStyles.tableRow]} wrap={false}>
                        <Text style={[tableStyles.tableCol, {maxWidth: "8%"}]}></Text>
                        <Text style={[tableStyles.tableCol, tableStyles.textLeft, {maxWidth: "30%"}, { fontStyle: "italic" }]}>Shipping Charges</Text>
                        <Text style={[tableStyles.tableCol, tableStyles.textRight, {maxWidth: "10%"}]}>1</Text>
                        <Text style={[tableStyles.tableCol, tableStyles.textRight, {maxWidth: "11%"}]}>0.00</Text>
                        <Text style={[tableStyles.tableCol, tableStyles.textRight, {maxWidth: "14%"}]}>0.00</Text>
                        <Text style={[tableStyles.tableCol, tableStyles.textRight, {maxWidth: "13%"}]}>-0.00</Text>
                        <Text style={[tableStyles.tableCol, tableStyles.textRight, {maxWidth: "14%"}]}>0.00</Text>
                    </View>

                    <View style={tableStyles.tableRow}>
                        <Text style={[tableStyles.tableColHeader, {maxWidth: "48%"}]}>Total</Text>
                        <Text style={[tableStyles.tableColHeader, {maxWidth: "11%"}, tableStyles.textRight]}>{orderData.noOfItems}</Text>
                        <Text style={[tableStyles.tableColHeader, {maxWidth: "14%"}, tableStyles.textRight]}>{orderData.total.toFixed(2)}</Text>
                        <Text style={[tableStyles.tableColHeader, {maxWidth: "13%"}, tableStyles.textRight]}>-{orderData.discount_amount?.toFixed(2)}</Text>
                        <Text style={[tableStyles.tableColHeader, {maxWidth: "14%"}, tableStyles.textRight]}>{orderData.final_total.toFixed(2)}</Text>
                    </View>
                </View>

                {orderData.coupon ?
                <View style={{marginTop: 10}}>
                    <Text style={{fontSize: 9, color: "#666", marginBottom: 5, fontWeight: "bold"}}>Discount Summary:</Text>
                        <Text style={{fontSize: 8, color: "#666", marginBottom: 2}}>
                            Coupon discount ({orderData.coupon?.code.toUpperCase()}): 
                            <Text style={{fontWeight: "bold"}}>{ `${orderData.discount_amount.toFixed(2)}`}</Text>
                        </Text>
                    {/* <Text style={{fontSize: 8, color: "#666", marginBottom: 2, fontWeight: "bold"}}>
                        Total savings: ${orderData.discount_amount}
                    </Text> */}
                </View>
                :
                null
                }

                {/* <View style={styles.summary}>
                    <View style={styles.summaryTable}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>
                                Subtotal ({orderData.items.length} items):
                            </Text>
                            <Text style={styles.summaryValue}>
                                ${orderData.total.toFixed(2)}
                            </Text>
                        </View>

                        {orderData.discount_amount > 0 && (
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Discount:</Text>
                                <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>
                                    -${orderData.discount_amount.toFixed(2)}
                                </Text>
                            </View>
                        )}

                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Shipping:</Text>
                            <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>
                                {orderData.shipping ? `$${orderData.shipping.toFixed(2)}` : 'FREE'}
                            </Text>
                        </View>

                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Tax:</Text>
                            <Text style={styles.summaryValue}>$0.00</Text>
                        </View>

                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>TOTAL:</Text>
                            <Text style={styles.totalValue}>
                                ${orderData.final_total.toFixed(2)}
                            </Text>
                        </View>
                    </View>
                </View> */}

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Thank you for shopping with Cartify!{'\n'}
                        For support, contact us at support@cartify.com or +91-1234567890{'\n'}
                        This is a computer-generated invoice. No signature required.
                    </Text>
                </View>
            </Page>
        </Document>
    )
}

export default OrderInvoice




// import {
//     Document,
//     Page,
//     Text,
//     View,
//     StyleSheet,
//     Image,
//     Font
// } from '@react-pdf/renderer'
// import dayjs from 'dayjs'
// import cartifyLogo from "../assets/cartify-logo.png"

// const styles = StyleSheet.create({
//     image: {
//         height: "auto",
//         width: "100px",
//         objectFit: "contain"
//     },
//     page: {
//         flexDirection: 'column',
//         backgroundColor: '#ffffff',
//         padding: 30,
//         fontSize: 10,
//         fontFamily: 'Helvetica'
//     },
//     header: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'flex-start',
//         marginBottom: 30,
//         paddingBottom: 15,
//         borderBottom: 2,
//         borderBottomColor: '#2196F3'
//     },
//     companyInfo: {
//         flex: 1
//     },
//     companyDetails: {
//         fontSize: 10,
//         color: '#666666',
//         lineHeight: 1.4
//     },
//     invoiceInfo: {
//         alignItems: 'flex-end'
//     },
//     invoiceTitle: {
//         fontSize: 28,
//         fontWeight: 'bold',
//         color: '#333333',
//         marginBottom: 10
//     },
//     invoiceNumber: {
//         fontSize: 12,
//         color: '#666666',
//         marginBottom: 3
//     },
//     customerSection: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         marginBottom: 30
//     },
//     customerInfo: {
//         flex: 1,
//         maxWidth: "45%"
//     },
//     sectionTitle: {
//         fontSize: 12,
//         fontWeight: 'bold',
//         color: '#333333',
//         marginBottom: 8,
//         borderBottom: 1,
//         borderBottomColor: '#E0E0E0',
//         paddingBottom: 3
//     },
//     customerText: {
//         fontSize: 10,
//         color: '#666666',
//         lineHeight: 1.5,
//         marginBottom: 2
//     },
//     orderInfo: {
//         alignItems: 'flex-end'
//     },
//     table: {
//         marginBottom: 30
//     },
//     footer: {
//         position: 'absolute',
//         bottom: 30,
//         left: 30,
//         right: 30,
//         textAlign: 'center',
//         borderTop: 1,
//         borderTopColor: '#E0E0E0',
//         paddingTop: 10
//     },
//     footerText: {
//         fontSize: 8,
//         color: '#888888',
//         lineHeight: 1.4
//     },
// })

// const tableStyles = StyleSheet.create({
//     table: {
//         display: "table",
//         width: "auto",
//         marginBottom: 10,
//     },
//     tableRow: {
//         flexDirection: "row",
//     },
//     tableColHeader: {
//         flex: 1,
//         borderStyle: "solid",
//         borderWidth: 1,
//         borderColor: "#bfbfbf",
//         backgroundColor: "#f0f0f0",
//         padding: 5,
//         fontSize: 10,
//         fontWeight: "bold",
//         textAlign: "center",
//     },
//     tableCol: {
//         flex: 1,
//         borderStyle: "solid",
//         borderWidth: 1,
//         borderColor: "#bfbfbf",
//         padding: 5,
//         fontSize: 10,
//         textAlign: "center",
//     },
//     summaryCol: {
//         flex: 1,
//         borderStyle: "solid",
//         borderWidth: 1,
//         borderColor: "#bfbfbf",
//         padding: 5,
//         fontSize: 10,
//         textAlign: "center",
//         backgroundColor: "#f8f9fa",
//         fontWeight: "bold"
//     },
//     totalCol: {
//         flex: 1,
//         borderStyle: "solid",
//         borderWidth: 1,
//         borderColor: "#bfbfbf",
//         padding: 5,
//         fontSize: 10,
//         textAlign: "center",
//         backgroundColor: "#2196F3",
//         color: "#ffffff",
//         fontWeight: "bold"
//     },
//     textLeft: {
//         textAlign: "left"
//     },
//     textRight: {
//         textAlign: "right"
//     },
//     bold: {
//         fontWeight: "bold",
//     },
//     discountRow: {
//         backgroundColor: "#fff3cd" // Light yellow background for discount rows
//     },
//     couponRow: {
//         backgroundColor: "#d1ecf1" // Light blue background for coupon rows
//     }
// })

// const OrderInvoice = ({ orderData }) => {
//     if (!orderData) return null

//     const calculateItemGrossAmount = (item) => {
//         return item.selling_price * item.quantity
//     }

//     const calculateItemDiscount = (item) => {
//         return (item.discount_amount || 0) * item.quantity
//     }

//     const calculateItemNetAmount = (item) => {
//         return item.purchase_price * item.quantity
//     }

//     const hasProductDiscounts = orderData.items.some(item => item.discount_amount > 0)
//     const hasCouponDiscount = orderData.coupon?.applies_to === "all" && orderData.discount_amount > 0

//     return (
//         <Document>
//             <Page size="A4" style={styles.page}>
//                 <View style={styles.header}>
//                     <View style={styles.companyInfo}>
//                         <Image style={styles.image} src={cartifyLogo} />
//                         <Text style={styles.companyDetails}>
//                             Your Trusted E-commerce Partner{'\n'}
//                             Phone: +91-1234567890{'\n'}
//                             Email: support@cartify.com
//                         </Text>
//                     </View>
//                     <View style={styles.invoiceInfo}>
//                         <Text style={styles.invoiceTitle}>INVOICE</Text>
//                         <Text style={styles.invoiceNumber}>Order #{orderData.order_id}</Text>
//                     </View>
//                 </View>

//                 <View style={styles.customerSection}>
//                     <View style={styles.customerInfo}>
//                         <Text style={styles.sectionTitle}>Bill To:</Text>
//                         <Text style={styles.customerText}>
//                             {orderData.user.first_name} {orderData.user.last_name}
//                         </Text>
//                         <Text style={styles.customerText}>
//                             {orderData.user.email}
//                         </Text>
//                         <Text style={styles.customerText}>
//                             {orderData.user.number}
//                         </Text>
//                     </View>
//                     <View style={styles.customerInfo}>
//                         <Text style={styles.sectionTitle}>Ship To:</Text>
//                         <Text style={styles.customerText}>
//                             {orderData.user.addLine1}
//                         </Text>
//                         <Text style={styles.customerText}>
//                             {orderData.user.addLine2}
//                         </Text>
//                         <Text style={styles.customerText}>
//                             {orderData.user.city}, {orderData.user.state} - {orderData.user.pincode}
//                         </Text>
//                     </View>
//                     <View style={styles.orderInfo}>
//                         <Text style={styles.sectionTitle}>Order Details:</Text>
//                         <Text style={styles.customerText}>
//                             Items: {orderData.items.length}
//                         </Text>
//                         <Text style={styles.customerText}>
//                             Order Date: {dayjs(orderData.order_date).format("MMM DD, YYYY")}
//                         </Text>
//                         <Text style={styles.customerText}>
//                             Delivered On: {dayjs(orderData.last_updated).format("MMM DD, YYYY")}
//                         </Text>
//                         {orderData.trackingNumber && (
//                             <Text style={styles.customerText}>
//                                 Tracking: {orderData.trackingNumber}
//                             </Text>
//                         )}
//                     </View>
//                 </View>

//                 <View style={tableStyles.table}>
//                     {/* Table Header */}
//                     <View style={tableStyles.tableRow}>
//                         <Text style={[tableStyles.tableColHeader, {maxWidth: "5%"}]}>#</Text>
//                         <Text style={[tableStyles.tableColHeader, {maxWidth: "35%"}]}>Item Description</Text>
//                         <Text style={[tableStyles.tableColHeader, {maxWidth: "8%"}]}>Qty</Text>
//                         <Text style={[tableStyles.tableColHeader, {maxWidth: "13%"}]}>Unit Price ($)</Text>
//                         <Text style={[tableStyles.tableColHeader, {maxWidth: "13%"}]}>Gross Amount ($)</Text>
//                         <Text style={[tableStyles.tableColHeader, {maxWidth: "13%"}]}>Discount ($)</Text>
//                         <Text style={[tableStyles.tableColHeader, {maxWidth: "13%"}]}>Net Amount ($)</Text>
//                     </View>

//                     {/* Product Rows */}
//                     {orderData.items.map((item, index) => (
//                         <View key={item.id} style={tableStyles.tableRow} wrap={false}>
//                             <Text style={[tableStyles.tableCol, {maxWidth: "5%"}]}>{index + 1}</Text>
//                             <View style={[tableStyles.tableCol, tableStyles.textLeft, {maxWidth: "35%"}]}>
//                                 <Text style={tableStyles.bold}>{item.title}</Text>
//                                 {item.brand && (
//                                     <Text style={{fontSize: 8, color: "#666", marginTop: 2}}>
//                                         Brand: {item.brand}
//                                     </Text>
//                                 )}
//                             </View>
//                             <Text style={[tableStyles.tableCol, tableStyles.textRight, {maxWidth: "8%"}]}>
//                                 {item.quantity}
//                             </Text>
//                             <Text style={[tableStyles.tableCol, tableStyles.textRight, {maxWidth: "13%"}]}>
//                                 {item.selling_price.toFixed(2)}
//                             </Text>
//                             <Text style={[tableStyles.tableCol, tableStyles.textRight, {maxWidth: "13%"}]}>
//                                 {calculateItemGrossAmount(item).toFixed(2)}
//                             </Text>
//                             <Text style={[tableStyles.tableCol, tableStyles.textRight, {maxWidth: "13%"}]}>
//                                 {calculateItemDiscount(item) > 0 ? 
//                                     `-${calculateItemDiscount(item).toFixed(2)}` : 
//                                     '0.00'
//                                 }
//                             </Text>
//                             <Text style={[tableStyles.tableCol, tableStyles.textRight, {maxWidth: "13%"}]}>
//                                 {calculateItemNetAmount(item).toFixed(2)}
//                             </Text>
//                         </View>
//                     ))}

//                     {/* Subtotal Row */}
//                     <View style={[tableStyles.tableRow, tableStyles.discountRow]} wrap={false}>
//                         <Text style={[tableStyles.summaryCol, {maxWidth: "48%"}]}>Subtotal</Text>
//                         <Text style={[tableStyles.summaryCol, tableStyles.textRight, {maxWidth: "8%"}]}>
//                             {orderData.noOfItems}
//                         </Text>
//                         <Text style={[tableStyles.summaryCol, tableStyles.textRight, {maxWidth: "13%"}]}>-</Text>
//                         <Text style={[tableStyles.summaryCol, tableStyles.textRight, {maxWidth: "13%"}]}>
//                             {orderData.items.reduce((sum, item) => sum + calculateItemGrossAmount(item), 0).toFixed(2)}
//                         </Text>
//                         <Text style={[tableStyles.summaryCol, tableStyles.textRight, {maxWidth: "13%"}]}>
//                             -{orderData.items.reduce((sum, item) => sum + calculateItemDiscount(item), 0).toFixed(2)}
//                         </Text>
//                         <Text style={[tableStyles.summaryCol, tableStyles.textRight, {maxWidth: "13%"}]}>
//                             {orderData.total.toFixed(2)}
//                         </Text>
//                     </View>

//                     {/* Coupon Discount Row (if applicable) */}
//                     {hasCouponDiscount && (
//                         <View style={[tableStyles.tableRow, tableStyles.couponRow]} wrap={false}>
//                             <Text style={[tableStyles.tableCol, {maxWidth: "48%"}]}>
//                                 Coupon Discount ({orderData.coupon.code.toUpperCase()})
//                             </Text>
//                             <Text style={[tableStyles.tableCol, tableStyles.textRight, {maxWidth: "8%"}]}>1</Text>
//                             <Text style={[tableStyles.tableCol, tableStyles.textRight, {maxWidth: "13%"}]}>
//                                 {orderData.discount_amount.toFixed(2)}
//                             </Text>
//                             <Text style={[tableStyles.tableCol, tableStyles.textRight, {maxWidth: "13%"}]}>
//                                 {orderData.discount_amount.toFixed(2)}
//                             </Text>
//                             <Text style={[tableStyles.tableCol, tableStyles.textRight, {maxWidth: "13%"}]}>
//                                 -{orderData.discount_amount.toFixed(2)}
//                             </Text>
//                             <Text style={[tableStyles.tableCol, tableStyles.textRight, {maxWidth: "13%"}]}>
//                                 0.00
//                             </Text>
//                         </View>
//                     )}

//                     {/* Final Total Row */}
//                     <View style={tableStyles.tableRow}>
//                         <Text style={[tableStyles.totalCol, {maxWidth: "61%"}]}>GRAND TOTAL</Text>
//                         <Text style={[tableStyles.totalCol, tableStyles.textRight, {maxWidth: "13%"}]}>
//                             {(orderData.items.reduce((sum, item) => sum + calculateItemGrossAmount(item), 0)).toFixed(2)}
//                         </Text>
//                         <Text style={[tableStyles.totalCol, tableStyles.textRight, {maxWidth: "13%"}]}>
//                             -{(orderData.items.reduce((sum, item) => sum + calculateItemDiscount(item), 0) + (hasCouponDiscount ? orderData.discount_amount : 0)).toFixed(2)}
//                         </Text>
//                         <Text style={[tableStyles.totalCol, tableStyles.textRight, {maxWidth: "13%"}]}>
//                             {orderData.final_total.toFixed(2)}
//                         </Text>
//                     </View>

//                     {/* Summary Section */}
//                     <View style={{marginTop: 10}}>
//                         <Text style={{fontSize: 9, color: "#666", marginBottom: 5}}>Discount Summary:</Text>
//                         {hasProductDiscounts && (
//                             <Text style={{fontSize: 8, color: "#666", marginBottom: 2}}>
//                                 • Product discounts: ${orderData.items.reduce((sum, item) => sum + calculateItemDiscount(item), 0).toFixed(2)}
//                             </Text>
//                         )}
//                         {hasCouponDiscount && (
//                             <Text style={{fontSize: 8, color: "#666", marginBottom: 2}}>
//                                 • Coupon discount ({orderData.coupon.code}): ${orderData.discount_amount.toFixed(2)}
//                             </Text>
//                         )}
//                         <Text style={{fontSize: 8, color: "#666", marginBottom: 2, fontWeight: "bold"}}>
//                             Total savings: ${((orderData.items.reduce((sum, item) => sum + calculateItemDiscount(item), 0)) + (hasCouponDiscount ? orderData.discount_amount : 0)).toFixed(2)}
//                         </Text>
//                     </View>
//                 </View>

//                 <View style={styles.footer}>
//                     <Text style={styles.footerText}>
//                         Thank you for shopping with Cartify!{'\n'}
//                         For support, contact us at support@cartify.com or +91-1234567890{'\n'}
//                         This is a computer-generated invoice. No signature required.
//                     </Text>
//                 </View>
//             </Page>
//         </Document>
//     )
// }

// export default OrderInvoice