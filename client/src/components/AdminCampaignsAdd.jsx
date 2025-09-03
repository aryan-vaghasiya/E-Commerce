// import CodeMirror, { EditorView } from "@uiw/react-codemirror";
// import { html } from "@codemirror/lang-html";
// import { css } from "@codemirror/lang-css";
// import { indentUnit } from '@codemirror/language';
// import { oneDark } from "@codemirror/theme-one-dark";
// import { useEffect, useState } from "react";
// import { Box, Button, Card, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Typography } from "@mui/material";
// import Split from "react-split";
// import { wrappedLineIndent } from 'codemirror-wrapped-line-indent';
// import { useSelector } from "react-redux";
// import { useForm } from "react-hook-form";

// function AdminCampaignsAdd() {

//     const userState = useSelector(state => state.userReducer)
//     const { register, handleSubmit, reset, formState: { errors } } = useForm();
//     const [openDialog, setOpenDialog] = useState(false)
//     const [code, setCode] = useState("<h1 style='color:blue'>Hello World</h1>");

//     const [files, setFiles] = useState({});
//     // const [files, setFiles] = useState({
//     //     "index.html": "<!DOCTYPE html>\n<html><h2>Select an existing file or create a new one.</h2></html>",
//     // });
//     const [activeFile, setActiveFile] = useState(null);

//     const fetchBasicTemplate = async (token) => {
//         try {
//             const res = await fetch("http://localhost:3000/admin/templates/get-basic", {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                 },
//             });
//             if(!res.ok){
//                 const error = await res.json()
//                 return console.error("Could not fetch basic template:", error.error);
//             }
//             const data = await res.json();
//             // console.log(data);
//             setCode(data.fileContent)
//         }
//         catch (err) {
//             console.error("Basic template fetch failed:", err.message);
//         }
//     }

//     const fetchAllTemplates = async (token, active = "any") => {
//         console.log(active);
//         try {
//             const res = await fetch(`http://localhost:3000/admin/templates/get-files?active=${active}`, {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                 },
//             });
//             if(!res.ok){
//                 const error = await res.json()
//                 return console.error("Could not fetch basic template:", error.error);
//             }
//             const data = await res.json();
//             console.log(data);
//             setFiles(data.files)
//             if(active === "any"){
//                 setActiveFile(Object.keys(data.files)[0]);
//             }
//             else{
//                 setActiveFile(active)
//             }
            
//         }
//         catch (err) {
//             console.error("Basic template fetch failed:", err.message);
//         }
//     }

//     const handleAddTemplate = async (formData) => {
//         // console.log(formData);

//         try {
//             const res = await fetch("http://localhost:3000/admin/templates/add", {
//                 method: "POST",
//                 headers: {
//                     Authorization: `Bearer ${userState.token}`,
//                     "Content-Type": "application/json"
//                 },
//                 body: JSON.stringify({fileName: formData.templateName})
//             });
//             if(!res.ok){
//                 const error = await res.json()
//                 return console.error("Could not add new file:", error.error);
//             }
//             fetchAllTemplates(userState.token, formData.templateName)
//         }
//         catch (err) {
//             console.error("Adding new template failed:", err.message);
//         }
//         finally{
//             setOpenDialog(false)
//         }
//     }

//     const handleFileChange = (file) => {
//         console.log(file);
        
//         fetchAllTemplates(userState.token, file)
//         setActiveFile(file)
//     }

//     useEffect(() => {
//         fetchBasicTemplate(userState.token)
//         fetchAllTemplates(userState.token)
//     }, [])

//     return (
//         <Box>
//             <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth>
//                 <DialogTitle>New Template</DialogTitle>
//                 <form onSubmit={handleSubmit(handleAddTemplate)} noValidate>
//                     <DialogContent>
//                         <TextField
//                             label="Template Name"
//                             {...register("templateName", { required: "Template name is required" })}
//                             autoFocus
//                             fullWidth
//                             autoComplete='off'
//                             slotProps={{htmlInput: { maxLength: 50 }}}
//                             error={!!errors.reason}
//                             helperText={errors.reason?.message}
//                         />
//                     </DialogContent>
//                     <DialogActions sx={{py: 2, px: 3}}>
//                         <Button onClick={() => setOpenDialog(false)} variant='contained' color="error">Back</Button>
//                         <Button type="submit" variant="contained">
//                             Add Template
//                         </Button>
//                     </DialogActions>
//                 </form>
//             </Dialog>
//             <Box sx={{
//                 "& .split": { display: "flex", flexDirection: "row", height: "100%" },
//                 "& .gutter": {
//                     backgroundColor: "#a1a1a1",
//                     backgroundRepeat: "no-repeat",
//                     backgroundPosition: "50%",
//                 },
//                 "& .gutter.gutter-horizontal": {
//                     backgroundImage:
//                     "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAIklEQVQoU2M4c+bMfxAGAgYYmwGrIIiDjrELjpo5aiZeMwF+yNnOs5KSvgAAAABJRU5ErkJggg==')",
//                     cursor: "col-resize",
//                     width: "8px",
//                 }
//             }}>
//                 <Split
//                     className="split"
//                     direction="horizontal"
//                     sizes={[15, 40, 45]}
//                     minSize={[100, 200, 150]}
//                     gutterSize={8}
//                 >
//                     <Box>
//                         <Box>
//                             <Button onClick={() => setOpenDialog(true)}>Add</Button>
//                         </Box>
//                         <Box>
//                             {Object.keys(files).length > 0 ?
//                             Object.keys(files).map((file, index) => (
//                                 <Card key={index} sx={{p: 1, mb: 1}} elevation={3} onClick={() => handleFileChange(file)}>
//                                     <Typography>{file}</Typography>
//                                 </Card>
//                             ))
//                             :
//                             <Card>
//                                 <Typography>You don't have any templates, Add a new one</Typography>
//                             </Card>
//                             }
//                         </Box>
//                     </Box>
//                     <Box>
//                         <Box sx={{height: `calc(100vh - 64px)`, display: "flex", flexDirection: "column", overflow: "auto"}}>
//                             <CodeMirror
//                                 // value={code}
//                                 value={files[activeFile]}
//                                 height="100%"
//                                 style={{ flex: 1 }} 
//                                 // extensions={[html(), css(), EditorView.contentAttributes.of({ "data-enable-grammarly": "false" })]}
//                                 extensions={[
//                                     html(), 
//                                     css(), 
//                                     EditorView.contentAttributes.of({ "data-enable-grammarly": "false" }), 
//                                     EditorView.lineWrapping,
//                                     indentUnit.of("    "),
//                                     wrappedLineIndent,
//                                 ]}
//                                 theme={oneDark}
//                                 // onChange={(val) => setCode(val)}
//                                 onChange={(val) => setFiles(prev => ({...prev, [activeFile]: val}))}
//                             />
//                         </Box>
//                     </Box>
//                     <Box>
//                         <Box sx={{borderRadius: "8px", height: "100%"}}>
//                             <iframe
//                                 // srcDoc={code}
//                                 srcDoc={files[activeFile]}
//                                 title="preview"
//                                 width="100%"
//                                 height="100%"
//                             />
//                         </Box>
//                     </Box>
//                 </Split>
//             </Box>
//         </Box>
//     )
// }

// export default AdminCampaignsAdd

import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { indentUnit } from '@codemirror/language';
import { oneDark } from "@codemirror/theme-one-dark";
import { useEffect, useState } from "react";
import { 
    Box, 
    Button, 
    Card, 
    Dialog, 
    DialogActions, 
    DialogContent, 
    DialogTitle, 
    TextField, 
    Typography,
    IconButton,
    Menu,
    MenuItem,
    Chip,
    Stack,
    Divider,
    Alert,
    DialogContentText,
    Snackbar
} from "@mui/material";
import { 
    Add as AddIcon, 
    MoreVert as MoreVertIcon, 
    Save as SaveIcon,
    InsertDriveFile as FileIcon,
    CheckCircle as CheckCircleIcon
} from "@mui/icons-material";
import Split from "react-split";
import { wrappedLineIndent } from 'codemirror-wrapped-line-indent';
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import CircleIcon from '@mui/icons-material/Circle';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import InfoIcon from '@mui/icons-material/Info';
import SendIcon from '@mui/icons-material/Send';
import { hideSnack, showSnack } from "../redux/snackbar/snackbarActions";

function AdminCampaignsAdd() {
    const userState = useSelector(state => state.userReducer)
    const snackbarState = useSelector((state) => state.snackbarReducer)
    const dispatch = useDispatch()
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const { register: registerRename, handleSubmit: handleSubmitRename, reset: resetRename, formState: { errors: errorsRename } } = useForm();

    const [openDialog, setOpenDialog] = useState(false)
    const [openRenameDialog, setOpenRenameDialog] = useState(false)
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
    const [openSaveDialog, setOpenSaveDialog] = useState(false)
    const [selectedFileForRename, setSelectedFileForRename] = useState(null)
    const [allFileNames, setAllFileNames] = useState({});
    const [originalFileContent, setOriginalFileContent] = useState({});
    const [activeFileName, setActiveFileName] = useState(null);
    const [activeFileContent, setActiveFileContent] = useState(null);
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [cooldown, setCooldown] = useState(0)

    // Check if current file has unsaved changes
    const hasUnsavedChanges = activeFileContent && originalFileContent !== activeFileContent;

    // const fetchBasicTemplate = async (token) => {
    //     try {
    //         const res = await fetch("http://localhost:3000/admin/templates/get-basic", {
    //             headers: {
    //                 Authorization: `Bearer ${token}`,
    //             },
    //         });
    //         if(!res.ok){
    //             const error = await res.json()
    //             return console.error("Could not fetch basic template:", error.error);
    //         }
    //         const data = await res.json();
    //         setCode(data.fileContent)
    //     }
    //     catch (err) {
    //         console.error("Basic template fetch failed:", err.message);
    //     }
    // }

    const handleSendTest = async () => {
        if (cooldown > 0) return
        setCooldown(30);

        try {
            const res = await fetch("http://localhost:3000/admin/campaigns/send-test", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${userState.token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({template: activeFileName})
            });
            if(!res.ok){
                const error = await res.json()
                dispatch(showSnack({message: error.error, severity: "warning"}))
                return console.error("Could not add new file:", error.error);
            }
            const email = await res.json()
            dispatch(showSnack({message: `Sent a test email on ${email}`, severity: "success"}))
        }
        catch (err) {
            dispatch(showSnack({message: err.error, severity: "warning"}))
            console.error("Adding new template failed:", err.message);
        }
    }

    useEffect(() => {
        if (cooldown === 0) return;

        const interval = setInterval(() => {
            setCooldown(prev => (prev <= 1 ? 0 : prev - 1));
        }, 1000);

        return () => clearInterval(interval);
    }, [cooldown]);

    const fetchAllTemplates = async (token, active = "any") => {
        // console.log(active);
        try {
            const res = await fetch(`http://localhost:3000/admin/templates/get-files?active=${active}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if(!res.ok){
                const error = await res.json()
                return console.error("Could not fetch all templates:", error.error);
            }
            const data = await res.json();
            // console.log(data);

            const fileNamesArr = []
            for(let item of data.files){
                fileNamesArr.push(item.name)
                if(item.name === active){
                    setActiveFileName(item.name)
                    setActiveFileContent(item.content)
                    setOriginalFileContent(item.content)
                }
            }
            setAllFileNames(fileNamesArr)

            if(active === "any"){
                setActiveFileName(data.files[0].name);
                setActiveFileContent(data.files[0].content)
                setOriginalFileContent(data.files[0].content) // Track original content
            }
        }
        catch (err) {
            console.error("Basic template fetch failed:", err.message);
        }
    }

    const handleAddTemplate = async (formData) => {
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
            // fetchAllTemplates(userState.token, formData.templateName)

            const newFile = await res.json()
            setAllFileNames(prev => [...prev, newFile.name])
            setActiveFileName(newFile.name)
            setActiveFileContent(newFile.content)
            setOriginalFileContent(newFile.content)
            reset(); // Reset form
        }
        catch (err) {
            console.error("Adding new template failed:", err.message);
        }
        finally{
            setOpenDialog(false)
        }
    }

    const handleSaveFile = async () => {
        if (!activeFileName || !hasUnsavedChanges) return;

        setIsSaving(true);
        try {
            const res = await fetch("http://localhost:3000/admin/templates/save", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${userState.token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    fileName: activeFileName,
                    content: activeFileContent
                })
            });
            if(!res.ok){
                const error = await res.json()
                return console.error("Could not save file:", error.error);
            }
            // Update original files to reflect saved state
            setOriginalFileContent(activeFileContent)
            // setOriginalFiles(prev => ({...prev, [activeFileName]: files[activeFileName]}));
        }
        catch (err) {
            console.error("Saving file failed:", err.message);
        }
        finally {
            setIsSaving(false);
        }
    }

    const handleRenameFile = async (formData) => {
        if (!selectedFileForRename) return;
        
        try {
            const res = await fetch("http://localhost:3000/admin/templates/rename", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${userState.token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    oldFileName: selectedFileForRename,
                    newFileName: formData.newTemplateName
                })
            });
            if(!res.ok){
                const error = await res.json()
                return console.error("Could not rename file:", error.error);
            }
            
            // Update local state
            const newFileNames = allFileNames.map(old => old === selectedFileForRename ? formData.newTemplateName : old)
            setAllFileNames(newFileNames)
            // const newFiles = { ...files };
            // const newOriginalFiles = { ...originalFiles };
            // newFiles[formData.newTemplateName] = newFiles[selectedFileForRename];
            // newOriginalFiles[formData.newTemplateName] = newOriginalFiles[selectedFileForRename];
            // delete newFiles[selectedFileForRename];
            // delete newOriginalFiles[selectedFileForRename];
            // setFiles(newFiles);
            // setOriginalFiles(newOriginalFiles);
            
            // Update active file if it was renamed
            if (activeFileName === selectedFileForRename) {
                setActiveFileName(formData.newTemplateName);
            }
            resetRename();
        }
        catch (err) {
            console.error("Renaming file failed:", err.message);
        }
        finally {
            setOpenRenameDialog(false);
            setSelectedFileForRename(null);
        }
    }

    const handleDeleteFile = async (fileName) => {
        console.log(fileName);
        try {
            const res = await fetch("http://localhost:3000/admin/templates/delete", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${userState.token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ fileName })
            });
            if(!res.ok){
                const error = await res.json()
                return console.error("Could not delete file:", error.error);
            }
            
            // Update local state

            const newFileNames = allFileNames.filter(item => item !== fileName)
            setAllFileNames(newFileNames)
            setOpenDeleteDialog(false)
            handleMenuClose();
            // const newFiles = { ...files };
            // const newOriginalFiles = { ...originalFiles };
            // delete newFiles[fileName];
            // delete newOriginalFiles[fileName];
            // setFiles(newFiles);
            // setOriginalFiles(newOriginalFiles);
            
            // Update active file if deleted file was active
            if (activeFileName === fileName) {
                // const remainingFiles = Object.keys(newFiles);
                setActiveFileName(newFileNames.length > 0 ? newFileNames[0] : null);
            }
        }
        catch (err) {
            console.error("Deleting file failed:", err.message);
        }
        finally {
            handleMenuClose();
        }
    }

    const handleFileChange = (file) => {
        if(hasUnsavedChanges){
            setSelectedFile(file)
            setOpenSaveDialog(true)
        }
        else{
            fetchAllTemplates(userState.token, file)
        }
        // setActiveFileName(file)
    }

    const handleMenuOpen = (event, fileName) => {
        event.stopPropagation();
        setMenuAnchor(event.currentTarget);
        setSelectedFile(fileName);
    }

    const handleMenuClose = () => {
        setMenuAnchor(null);
        setSelectedFile(null);
    }

    const handleRenameClick = () => {
        setSelectedFileForRename(selectedFile);
        setOpenRenameDialog(true);
        handleMenuClose();
    }

    const handleDeleteClick = () => {
        // if (selectedFile && window.confirm(`Are you sure you want to delete "${selectedFile}"?`)) {
        //     handleDeleteFile(selectedFile);
        // }

        setOpenDeleteDialog(true)
        // handleMenuClose();
    }

    const handleDeleteConfirmation = (confirmation) => {
        if(!confirmation){
            handleMenuClose()
            setOpenDeleteDialog(false)
        }
        else{
            handleDeleteFile(selectedFile)
        }
    }

    const handleSaveConfirmation = (confirmation) => {
        if(confirmation){
            handleSaveFile()
        }
        fetchAllTemplates(userState.token, selectedFile)
        setOpenSaveDialog(false)
    }

    useEffect(() => {
        // fetchBasicTemplate(userState.token)
        fetchAllTemplates(userState.token)
    }, [])

    return (
        <Box>
            <Snackbar
                open={snackbarState.show}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
                autoHideDuration={5000}
                onClose={() => dispatch(hideSnack())}
                sx={{
                    '&.MuiSnackbar-root': { top: '70px' },
                }}
            >
                <Alert onClose={() => dispatch(hideSnack())} severity={snackbarState.severity} variant="filled">
                    {snackbarState.message}
                </Alert>
            </Snackbar>
            {/* Add Template Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
                <DialogTitle>Create New Template</DialogTitle>
                <form onSubmit={handleSubmit(handleAddTemplate)} noValidate>
                    <DialogContent>
                        <TextField
                            label="Template Name"
                            {...register("templateName", { required: "Template name is required" })}
                            autoFocus
                            fullWidth
                            autoComplete='off'
                            slotProps={{htmlInput: { maxLength: 50 }}}
                            error={!!errors.templateName}
                            helperText={errors.templateName?.message}
                            sx={{ mt: 1 }}
                        />
                    </DialogContent>
                    <DialogActions sx={{py: 2, px: 3}}>
                        <Button variant="outlined" onClick={() => { setOpenDialog(false); reset(); }} color="error">
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained">
                            Create Template
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Rename Template Dialog */}
            <Dialog open={openRenameDialog} onClose={() => setOpenRenameDialog(false)} fullWidth maxWidth="sm">
                <DialogTitle>Rename Template</DialogTitle>
                <form onSubmit={handleSubmitRename(handleRenameFile)} noValidate>
                    <DialogContent>
                        <TextField
                            label="New Template Name"
                            {...registerRename("newTemplateName", { required: "Template name is required" })}
                            autoFocus
                            fullWidth
                            autoComplete='off'
                            defaultValue={selectedFileForRename}
                            slotProps={{htmlInput: { maxLength: 50 }}}
                            error={!!errorsRename.newTemplateName}
                            helperText={errorsRename.newTemplateName?.message}
                            sx={{ mt: 1 }}
                        />
                    </DialogContent>
                    <DialogActions sx={{py: 2, px: 3}}>
                        <Button variant="outlined" onClick={() => { setOpenRenameDialog(false); resetRename(); setSelectedFileForRename(null); }} color="error">
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained">
                            Rename
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Delete Template Dialog */}
            <Dialog
                open={openDeleteDialog}
                onClose={() => setOpenDeleteDialog(false)}
            >
                <DialogTitle>
                    Delete template 
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this template?
                    </DialogContentText>
                    <DialogContentText>
                        This template will be permanently deleted.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button variant='outlined' onClick={() => handleDeleteConfirmation(false)}>Back</Button>
                    <Button onClick={() => handleDeleteConfirmation(true)} autoFocus variant='contained' color='error'>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Save Template Dialog */}
            <Dialog
                open={openSaveDialog}
                onClose={() => setOpenSaveDialog(false)}
            >
                <DialogTitle>
                    Save template 
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Save changes ?
                    </DialogContentText>
                    <DialogContentText>
                        You had some unsaved changes on previous file, would you like to apply those changes?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button variant='outlined' color='error' onClick={() => handleSaveConfirmation(false)}>No</Button>
                    <Button onClick={() => handleSaveConfirmation(true)} autoFocus variant='contained'>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Three-dot Menu */}
            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <MenuItem onClick={handleRenameClick}>
                    Rename
                </MenuItem>
                <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
                    Delete
                </MenuItem>
            </Menu>

            <Box sx={{
                "& .split": { display: "flex", flexDirection: "row", height: "100%" },
                "& .gutter": {
                    backgroundColor: "#333333",
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
                    sizes={[20, 40, 40]}
                    minSize={[150, 200, 150]}
                    gutterSize={8}
                >
                    {/* File Management Panel */}
                    <Box sx={{ p: 2, height: `calc(100vh - 64px)`, overflow: 'auto' }}>
                        {/* Header with Add and Save buttons */}
                        <Stack spacing={2} sx={{ mb: 2 }}>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => setOpenDialog(true)}
                                fullWidth
                            >
                                Add Template
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<SendIcon />}
                                fullWidth
                                onClick={handleSendTest}
                                disabled={cooldown > 0 || hasUnsavedChanges}
                            >
                                { cooldown > 0 ? `Wait ${cooldown}s` : hasUnsavedChanges ? `Save to test` : "Send Test Email"}
                            </Button>

                            {hasUnsavedChanges && (
                                <Button
                                    variant="outlined"
                                    startIcon={<SaveIcon />}
                                    onClick={handleSaveFile}
                                    disabled={isSaving}
                                    color="primary"
                                    fullWidth
                                >
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </Button>
                            )}
                        </Stack>

                        <Divider sx={{ mb: 2 }} />

                        {/* File List */}
                        <Typography variant="overline" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                            {/* All Templates (allFileNames ? {allFileNames.length} : 0) */}
                            All Templates ({allFileNames?.length || 0})
                        </Typography>
                        
                        {allFileNames.length > 0 ? (
                            <Stack spacing={1}>
                                {allFileNames.map((file, index) => (
                                    <Card 
                                        key={index} 
                                        sx={{
                                            p: 0,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            border: activeFileName === file ? 1 : 0,
                                            borderColor: 'primary.main',
                                            '&:hover': {
                                                bgcolor: 'grey.200',
                                                transform: 'translateY(-1px)',
                                                boxShadow: 2
                                            }
                                        }} 
                                        elevation={activeFileName === file ? 4 : 2}
                                        onClick={() => handleFileChange(file)}
                                    >
                                        <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <FileIcon fontSize="small" color={activeFileName === file ? 'primary' : 'action'} />
                                            
                                            <Typography 
                                                variant="body2" 
                                                fontWeight={activeFileName === file ? 'medium' : 'normal'}
                                                color={activeFileName === file ? 'primary.main' : 'text.primary'}
                                                noWrap
                                                sx={{ 
                                                    flex: 1,
                                                    minWidth: 0, // This is important for text truncation to work properly
                                                }}
                                                title={file} // Show full filename on hover
                                            >
                                                {file}
                                            </Typography>
                                            
                                            {/* Always show modification dot if file is modified */}
                                            {activeFileName === file && activeFileContent !== originalFileContent && (
                                                <FiberManualRecordIcon 
                                                    fontSize="small" 
                                                    color="warning"
                                                    sx={{ flexShrink: 0 }} // Prevent the dot from shrinking
                                                />
                                            )}
                                            
                                            {/* Always show 3-dot menu */}
                                            <IconButton
                                                size="small"
                                                onClick={(e) => handleMenuOpen(e, file)}
                                                sx={{ 
                                                    opacity: 0.7,
                                                    flexShrink: 0, // Prevent the button from shrinking
                                                    '&:hover': { opacity: 1 }
                                                }}
                                            >
                                                <MoreVertIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </Card>

                                ))}
                            </Stack>
                        ) : (
                            <Card sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
                                <FileIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                                <Typography variant="body2" color="text.secondary">
                                    No templates found
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Click "Add Template" to create your first template
                                </Typography>
                            </Card>
                        )}
                        {/* Dynamic Variables Note */}
                        <Card sx={{ p: 2, mt: 2, border: 1,}}>
                            <Stack direction="row" spacing={1} alignItems="flex-start">
                                <InfoIcon color="info" fontSize="small" sx={{ mt: 0.25 }} />
                                <Box>
                                    <Typography variant="body2" fontWeight="medium" color="info.dark" sx={{ mb: 0.5 }}>
                                        Dynamic Variables
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                                        Use <Box component="code" sx={{ px: 0.5, py: 0.25, bgcolor: 'grey.200', borderRadius: 0.5, fontFamily: 'monospace' }}>{'{{fName}}'}</Box> and <Box component="code" sx={{ px: 0.5, py: 0.25, bgcolor: 'grey.200', borderRadius: 0.5, fontFamily: 'monospace' }}>{'{{lName}}'}</Box> in your templates. They will be automatically replaced with the recipient's first and last name when emails are sent.
                                    </Typography>
                                </Box>
                            </Stack>
                        </Card>
                    </Box>

                    {/* Code Editor Panel */}
                    <Box>
                        <Box sx={{height: `calc(100vh - 64px)`, display: "flex", flexDirection: "column", overflow: "auto"}}>
                            <CodeMirror
                                key={activeFileName}
                                // value={files[activeFileName] || ''}
                                value={activeFileContent || ''}
                                height="100%"
                                style={{ flex: 1 }} 
                                extensions={[
                                    html(),
                                    css(),
                                    EditorView.contentAttributes.of({ "data-enable-grammarly": "false" }), 
                                    EditorView.lineWrapping,
                                    indentUnit.of("    "),
                                    wrappedLineIndent,
                                ]}
                                theme={oneDark}
                                // onChange={(val) => setFiles(prev => ({...prev, [activeFileName]: val}))}
                                onChange={(val) => setActiveFileContent(val)}
                            />
                        </Box>
                    </Box>

                    {/* Preview Panel */}
                    <Box>
                        <Box sx={{borderRadius: "8px", height: "100%"}}>
                            <iframe
                                // srcDoc={activeFileContent || ''}
                                srcDoc={activeFileContent ? activeFileContent.replaceAll("{{fName}}", "John").replaceAll("{{lName}}", "Doe") : ''}
                                // sandbox="allow-same-origin"
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
