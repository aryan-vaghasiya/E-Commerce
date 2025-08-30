import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { indentUnit } from '@codemirror/language';
import { oneDark } from "@codemirror/theme-one-dark";
import { useEffect, useState } from "react";
import { Box, Button, Card, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Typography } from "@mui/material";
import Split from "react-split";
import { wrappedLineIndent } from 'codemirror-wrapped-line-indent';
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";

function AdminCampaignsAdd() {

    const userState = useSelector(state => state.userReducer)
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const [openDialog, setOpenDialog] = useState(false)
    const [code, setCode] = useState("<h1 style='color:blue'>Hello World</h1>");

    const [files, setFiles] = useState({});
    // const [files, setFiles] = useState({
    //     "index.html": "<!DOCTYPE html>\n<html><h2>Select an existing file or create a new one.</h2></html>",
    // });
    const [activeFile, setActiveFile] = useState(null);

    const fetchBasicTemplate = async (token) => {
        try {
            const res = await fetch("http://localhost:3000/admin/templates/get-basic", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if(!res.ok){
                const error = await res.json()
                return console.error("Could not fetch basic template:", error.error);
            }
            const data = await res.json();
            // console.log(data);
            setCode(data.fileContent)
        }
        catch (err) {
            console.error("Basic template fetch failed:", err.message);
        }
    }

    const fetchAllTemplates = async (token, active = "any") => {
        console.log(active);
        try {
            const res = await fetch(`http://localhost:3000/admin/templates/get-files?active=${active}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if(!res.ok){
                const error = await res.json()
                return console.error("Could not fetch basic template:", error.error);
            }
            const data = await res.json();
            console.log(data);
            setFiles(data.files)
            if(active === "any"){
                setActiveFile(Object.keys(data.files)[0]);
            }
            else{
                setActiveFile(active)
            }
            
        }
        catch (err) {
            console.error("Basic template fetch failed:", err.message);
        }
    }

    const handleAddTemplate = async (formData) => {
        // console.log(formData);

        try {
            const res = await fetch("http://localhost:3000/admin/templates/add", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${userState.token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({fileName: formData.templateName})
            });
            if(!res.ok){
                const error = await res.json()
                return console.error("Could not add new file:", error.error);
            }
            fetchAllTemplates(userState.token, formData.templateName)
        }
        catch (err) {
            console.error("Adding new template failed:", err.message);
        }
        finally{
            setOpenDialog(false)
        }
    }

    const handleFileChange = (file) => {
        console.log(file);
        
        fetchAllTemplates(userState.token, file)
        setActiveFile(file)
    }

    useEffect(() => {
        fetchBasicTemplate(userState.token)
        fetchAllTemplates(userState.token)
    }, [])

    return (
        <Box>
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth>
                <DialogTitle>New Template</DialogTitle>
                <form onSubmit={handleSubmit(handleAddTemplate)} noValidate>
                    <DialogContent>
                        {/* <DialogContentText sx={{pb: 2}}>
                            The order amount will be refunded in user's wallet.
                        </DialogContentText> */}
                        <TextField
                            label="Template Name"
                            {...register("templateName", { required: "Template name is required" })}
                            autoFocus
                            fullWidth
                            autoComplete='off'
                            slotProps={{htmlInput: { maxLength: 50 }}}
                            error={!!errors.reason}
                            helperText={errors.reason?.message}
                        />
                    </DialogContent>
                    <DialogActions sx={{py: 2, px: 3}}>
                        <Button onClick={() => setOpenDialog(false)} variant='contained' color="error">Back</Button>
                        <Button type="submit" variant="contained">
                            Add Template
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
            <Box sx={{
                "& .split": { display: "flex", flexDirection: "row", height: "100%" },
                "& .gutter": {
                    backgroundColor: "#a1a1a1",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "50%",
                },
                "& .gutter.gutter-horizontal": {
                    backgroundImage:
                    "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAIklEQVQoU2M4c+bMfxAGAgYYmwGrIIiDjrELjpo5aiZeMwF+yNnOs5KSvgAAAABJRU5ErkJggg==')",
                    cursor: "col-resize",
                    width: "8px",
                }
            }}>
                <Split
                    className="split"
                    direction="horizontal"
                    sizes={[15, 40, 45]}
                    minSize={[100, 200, 150]}
                    gutterSize={8}
                >
                    <Box>
                        <Box>
                            <Button onClick={() => setOpenDialog(true)}>Add</Button>
                        </Box>
                        <Box>
                            {Object.keys(files).length > 0 ?
                            Object.keys(files).map((file, index) => (
                                <Card key={index} sx={{p: 1, mb: 1}} elevation={3} onClick={() => handleFileChange(file)}>
                                    <Typography>{file}</Typography>
                                </Card>
                            ))
                            :
                            <Card>
                                <Typography>You don't have any templates, Add a new one</Typography>
                            </Card>
                            }
                        </Box>
                    </Box>
                    <Box>
                        <Box sx={{height: `calc(100vh - 64px)`, display: "flex", flexDirection: "column", overflow: "auto"}}>
                            <CodeMirror
                                // value={code}
                                value={files[activeFile]}
                                height="100%"
                                style={{ flex: 1 }} 
                                // extensions={[html(), css(), EditorView.contentAttributes.of({ "data-enable-grammarly": "false" })]}
                                extensions={[
                                    html(), 
                                    css(), 
                                    EditorView.contentAttributes.of({ "data-enable-grammarly": "false" }), 
                                    EditorView.lineWrapping,
                                    indentUnit.of("    "),
                                    wrappedLineIndent,
                                ]}
                                theme={oneDark}
                                onChange={(val) => setCode(val)}
                            />
                        </Box>
                    </Box>
                    <Box>
                        <Box sx={{borderRadius: "8px", height: "100%"}}>
                            <iframe
                                // srcDoc={code}
                                srcDoc={files[activeFile]}
                                title="preview"
                                width="100%"
                                height="100%"
                            />
                        </Box>
                    </Box>
                </Split>
            </Box>
        </Box>
    )
}

export default AdminCampaignsAdd