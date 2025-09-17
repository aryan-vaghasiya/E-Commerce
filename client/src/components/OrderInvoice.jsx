import React from 'react'
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

// Register custom fonts (optional)
// Font.register({
//     family: 'Roboto',
//     src: 'https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Mu4mxP.ttf'
// })

// Create styles
const styles = StyleSheet.create({
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
    companyName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2196F3',
        marginBottom: 5
    },
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
    statusBadge: {
        backgroundColor: '#e3f2fd',
        padding: '4 8',
        borderRadius: 4,
        marginTop: 5
    },
    statusText: {
        fontSize: 8,
        color: '#1976d2',
        fontWeight: 'bold',
        textTransform: 'uppercase'
    },
    customerSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30
    },
    customerInfo: {
        flex: 1
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
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f5f5f5',
        padding: 8,
        fontWeight: 'bold',
        fontSize: 10,
        color: '#333333',
        borderBottom: 1,
        borderBottomColor: '#ddd'
    },
    tableRow: {
        flexDirection: 'row',
        padding: 8,
        borderBottom: 1,
        borderBottomColor: '#f0f0f0',
        minHeight: 40,
        alignItems: 'center'
    },
    tableRowEven: {
        backgroundColor: '#fafafa'
    },
    col1: { width: '8%' },
    col2: { width: '40%' },
    col3: { width: '15%' },
    col4: { width: '12%' },
    col5: { width: '15%', textAlign: 'right' },
    col6: { width: '10%', textAlign: 'right' },
    itemName: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 2
    },
    itemBrand: {
        fontSize: 8,
        color: '#888888'
    },
    itemRating: {
        fontSize: 8,
        color: '#FF8C00'
    },
    priceText: {
        fontSize: 10,
        color: '#333333',
        textAlign: 'right'
    },
    summary: {
        marginTop: 20,
        alignItems: 'flex-end'
    },
    summaryTable: {
        width: '40%',
        minWidth: 200
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
        backgroundColor: '#2196F3',
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
    divider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 10
    }
})

const OrderInvoice = ({ orderData }) => {
    if (!orderData) return null

    const getStatusColor = (status) => {
        switch(status) {
            case 'pending': return '#FF9800'
            case 'accepted': return '#2196F3'
            case 'dispatched': return '#4CAF50'
            case 'delivered': return '#8BC34A'
            case 'cancelled': return '#F44336'
            default: return '#9E9E9E'
        }
    }

    const calculateSubtotal = () => {
        return orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    }

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.companyInfo}>
                        <Text style={styles.companyName}>Cartify</Text>
                        <Text style={styles.companyDetails}>
                            Your Trusted E-commerce Partner{'\n'}
                            123 Business Street{'\n'}
                            Tech City, TC 12345{'\n'}
                            Phone: +1 (555) 123-4567{'\n'}
                            Email: support@cartify.com
                        </Text>
                    </View>
                    <View style={styles.invoiceInfo}>
                        <Text style={styles.invoiceTitle}>INVOICE</Text>
                        <Text style={styles.invoiceNumber}>Order #{orderData.order_id}</Text>
                        <Text style={styles.invoiceNumber}>
                            Date: {dayjs(orderData.order_date).format('MMM DD, YYYY')}
                        </Text>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(orderData.status) + '20' }]}>
                            <Text style={[styles.statusText, { color: getStatusColor(orderData.status) }]}>
                                {orderData.status.toUpperCase()}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Customer Information */}
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
                            Payment: Wallet/Card
                        </Text>
                        {orderData.trackingNumber && (
                            <Text style={styles.customerText}>
                                Tracking: {orderData.trackingNumber}
                            </Text>
                        )}
                    </View>
                </View>

                {/* Items Table */}
                <View style={styles.table}>
                    {/* Table Header */}
                    <View style={styles.tableHeader}>
                        <Text style={styles.col1}>#</Text>
                        <Text style={styles.col2}>Item Description</Text>
                        <Text style={styles.col3}>Brand</Text>
                        <Text style={styles.col4}>Unit Price</Text>
                        <Text style={styles.col5}>Quantity</Text>
                        <Text style={styles.col6}>Total</Text>
                    </View>

                    {/* Table Rows */}
                    {orderData.items.map((item, index) => (
                        <View 
                            key={item.id} 
                            style={[
                                styles.tableRow, 
                                index % 2 === 1 ? styles.tableRowEven : {}
                            ]}
                        >
                            <Text style={styles.col1}>{index + 1}</Text>
                            <View style={styles.col2}>
                                <Text style={styles.itemName}>{item.title}</Text>
                            </View>
                            <Text style={styles.col3}>{item.brand}</Text>
                            <Text style={[styles.col4, styles.priceText]}>
                                ${item.price.toFixed(2)}
                            </Text>
                            <Text style={styles.col5}>{item.quantity}</Text>
                            <Text style={[styles.col6, styles.priceText]}>
                                ${(item.price * item.quantity).toFixed(2)}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Price Summary */}
                <View style={styles.summary}>
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
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Thank you for shopping with Cartify!{'\n'}
                        For support, contact us at support@cartify.com or +1 (555) 123-4567{'\n'}
                        This is a computer-generated invoice. No signature required.
                    </Text>
                </View>
            </Page>
        </Document>
    )
}

export default OrderInvoice
