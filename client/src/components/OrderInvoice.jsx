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
        flex: 1,
        // border: "1px solid black"
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
        alignItems: 'flex-end',
        height: "100%",
        // border: "1px solid black"
    },
    invoiceTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 10
    },
    invoiceNumber: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 3
        // marginVertical: "auto"
    },
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
    summary: {
        marginTop: 20,
        alignItems: 'flex-end',
    },
    summaryTable: {
        // width: '40%',
        // minWidth: 230,
        // width: 219,
        width: "41%",
        backgroundColor: "#f0f0f0",
        fontWeight: "bold",
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: "#bfbfbf",
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
        paddingHorizontal: 8
    },
    summaryLabel: {
        fontSize: 10,
        color: '#666666'
    },
    summaryValue: {
        fontSize: 10,
        color: '#333333',
        fontWeight: 'bold'
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        paddingHorizontal: 8,
        // backgroundColor: '#2196F3',
        backgroundColor: 'grey',
        marginTop: 5
    },
    totalLabel: {
        fontSize: 12,
        color: '#ffffff',
        fontWeight: 'bold'
    },
    totalValue: {
        fontSize: 12,
        color: '#ffffff',
        fontWeight: 'bold'
    },
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

        wordWrap: "break-word",
        wordBreak: "break-all", // This will break long numbers
        overflowWrap: "anywhere", // Additional support
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

    const breakLongNumbers = (value, maxDigits = 6) => {
        const str = String(value);
        
        if (str.length <= maxDigits) return str;
        
        const parts = [];
        for (let i = 0; i < str.length; i += maxDigits) {
            parts.push(str.slice(i, i + maxDigits));
        }
        return parts.join('\n');
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
                        <View style={{ justifyContent: "center", flex: 1}}>
                            <Text style={styles.invoiceNumber}>Order #{orderData.order_id}</Text>
                        </View>
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
                        <Text style={[tableStyles.tableColHeader, , {maxWidth: "11%"}]}>Unit Price ($)</Text>
                        <Text style={[tableStyles.tableColHeader, {maxWidth: "10%"}]}>Quantity</Text>
                        <Text style={[tableStyles.tableColHeader, {maxWidth: "14%"}]}>Gross Amount ($)</Text>
                        <Text style={[tableStyles.tableColHeader, {maxWidth: "13%"}]}>Discount ($)</Text>
                        <Text style={[tableStyles.tableColHeader, {maxWidth: "14%"}]}>Total ($)</Text>
                    </View>

                    {orderData.items.map((item, index) => (
                        <View key={item.id} style={[tableStyles.tableRow]} wrap={false}>
                            <Text style={[tableStyles.tableCol, {maxWidth: "8%"}]}>
                                {index + 1}
                            </Text>
                            <View style={[tableStyles.tableCol, tableStyles.textLeft, {maxWidth: "30%"}]}>
                                <Text style={tableStyles.bold}>
                                    {item.title}
                                </Text>
                                    {item.brand && (
                                        <Text style={{fontSize: 8, color: "#666", marginTop: 2}}>
                                            Brand: {item.brand}
                                        </Text>
                                    )}
                            </View>
                            {/* <Text style={[tableStyles.tableCol, tableStyles.textLeft, {maxWidth: "30%"}]}>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</Text> */}
                            {/* <Text style={[tableStyles.tableCol, tableStyles.textRight, {maxWidth: "10%"}]}>{item.quantity}</Text> */}
                            <Text style={[tableStyles.tableCol, tableStyles.textRight, {maxWidth: "11%"}]}>
                                {breakLongNumbers(item.selling_price.toFixed(2))}
                            </Text>
                            <Text style={[tableStyles.tableCol, tableStyles.textRight, {maxWidth: "10%"}]}>
                                {breakLongNumbers(item.quantity)}
                            </Text>
                            <Text style={[tableStyles.tableCol, tableStyles.textRight, {maxWidth: "14%"}]}>
                                {breakLongNumbers((item.selling_price * item.quantity).toFixed(2))}
                            </Text>
                            <Text style={[tableStyles.tableCol, tableStyles.textRight, {maxWidth: "13%"}]}>
                                -{breakLongNumbers((item.discount_amount * item.quantity).toFixed(2))}
                            </Text>
                            <Text style={[tableStyles.tableCol, tableStyles.textRight, {maxWidth: "14%"}]}>
                                {breakLongNumbers((item.purchase_price * item.quantity).toFixed(2))}
                            </Text>
                        </View>
                    ))}

                    {/* {orderData.coupon?.applies_to === "all" ?
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
                    </View> */}
                </View>

                {/* {orderData.coupon ?
                    <View style={{marginTop: 10}}>
                        <Text style={{fontSize: 9, color: "#666", marginBottom: 5, fontWeight: "bold"}}>Discount Summary:</Text>
                            <Text style={{fontSize: 8, color: "#666", marginBottom: 2}}>
                                Coupon discount ({orderData.coupon?.code.toUpperCase()}): 
                                <Text style={{fontWeight: "bold"}}>{ `${orderData.discount_amount.toFixed(2)}`}</Text>
                            </Text>
                    </View>
                    :
                    null
                } */}

                <View style={styles.summary}>
                    <View style={styles.summaryTable}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>
                                Subtotal ({orderData.items.length} items):
                            </Text>
                            <Text style={styles.summaryValue}>
                                ${breakLongNumbers(orderData.total.toFixed(2))}
                            </Text>
                        </View>

                        {orderData.discount_amount > 0 && (
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Discount ({orderData.coupon?.code.toUpperCase()}):</Text>
                                <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>
                                    -${breakLongNumbers(orderData.discount_amount?.toFixed(2))}
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
                            <Text style={styles.totalLabel}>FINAL TOTAL:</Text>
                            <Text style={[styles.totalValue, {maxWidth: "60%"}]}>
                                ${orderData.final_total.toFixed(2)}
                                {/* ${breakLongNumbers((999999999999999).toFixed(2), 18)} */}
                            </Text>
                        </View>
                    </View>
                </View>

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