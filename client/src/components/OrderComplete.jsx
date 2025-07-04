import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import Typography from "@mui/material/Typography";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { hideSnack } from "../redux/snackbar/snackbarActions";

function OrderComplete() {
    const snackbarState = useSelector((state) => state.snackbarReducer)
    const navigate = useNavigate()
    const dispatch = useDispatch()
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                bgcolor: "#EEEEEE",
                alignItems: "center",
                minHeight: "91vh",
            }}
        >
            <Snackbar
                open={snackbarState.show}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
                autoHideDuration={2000}
                onClose={() => dispatch(hideSnack())}
                sx={{
                    "&.MuiSnackbar-root": { top: "70px" },
                }}
            >
                <Alert
                    onClose={() => dispatch(hideSnack())}
                    severity={snackbarState.severity}
                    variant="filled"
                >
                    {snackbarState.message}
                </Alert>
            </Snackbar>
            <Box sx={{ margin: "auto", textAlign: "center" }}>
                <Typography component="h1">Order Confirmed !!!</Typography>
                <Button
                    variant="contained"
                    onClick={() => navigate("/")}
                    sx={{ width: "100%", my: 1 }}
                >
                    Continue Shopping
                </Button>
            </Box>
        </Box>
    );
}

export default OrderComplete;
