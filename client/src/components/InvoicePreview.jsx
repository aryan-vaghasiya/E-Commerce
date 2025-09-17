import React, { useState } from 'react'
import { PDFViewer } from '@react-pdf/renderer'
import OrderInvoice from './OrderInvoice'
import { Dialog, DialogContent, DialogActions, Button, useMediaQuery, useTheme } from '@mui/material'

const InvoicePreview = ({ orderData }) => {

    return (
        <PDFViewer 
            style={{ 
                minHeight: "500px",
                width: '100%', 
                height: '100%', 
                border: 'none' 
            }}
        >
            <OrderInvoice orderData={orderData} />
        </PDFViewer>
    )
}

export default InvoicePreview