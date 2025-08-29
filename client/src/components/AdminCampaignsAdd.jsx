// import { Box } from "@mui/material"
// import Editor from "react-simple-code-editor";
// import Prism from "prismjs";
// import "prismjs/themes/prism.css"
// import "prismjs/components/prism-markup"; 
// import "prismjs/components/prism-css";  


// import { useState } from "react";

// function AdminCampaignsAdd() {
// const [code, setCode] = useState("<h1 style='color:blue'>Hello World</h1>");

//     const highlightWithPrism = (code) => Prism.highlight(code, Prism.languages.markup, "markup");

//     return (
//         <Box sx={{ display: "flex", gap: "20px"}}>
//         {/* Editor */}
//             <Editor
//                 value={code}
//                 onValueChange={(code) => setCode(code)}
//                 highlight={highlightWithPrism}
//                 // highlight={() => Prism.highlightAll()}
//                 padding={12}
//                 style={{
//                     fontFamily: '"Fira Code", monospace',
//                     fontSize: 14,
//                     fontWeight: 600,
//                     backgroundColor: '#222222', // Custom background color
//                     color: '#abb2bf', // Custom text color
//                     border: '1px solid #61afef', // Custom border
//                     borderRadius: "8px",
//                     width: "50%",
//                     minHeight: "400px",
//                     maxHeight: "700px",
//                     overflow: "auto"
//                 }}
//             />

//             {/* Preview */}
//             <iframe
//                 srcDoc={code}
//                 style={{
//                     width: "50%",
//                     minHeight: "400px",
//                     border: "1px solid #ddd",
//                     borderRadius: "8px",
//                 }}
//                 title="preview"
//             />
//         </Box>
//     );
// }

// export default AdminCampaignsAdd

import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { oneDark } from "@codemirror/theme-one-dark";
import { useState } from "react";
import { Box, Card } from "@mui/material";
import Split from "react-split";

function AdminCampaignsAdd() {

    const [code, setCode] = useState("<h1 style='color:blue'>Hello World</h1>");

    return (
        <Box>
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
                    sizes={[50, 50]}
                    minSize={200}
                    gutterSize={8}
                >
                    <div>
                        <Box sx={{height: `calc(100vh - 64px)`, display: "flex", flexDirection: "column", overflow: "auto"}}>
                            <CodeMirror
                                value={code}
                                height="100%"
                                style={{ flex: 1 }} 
                                // extensions={[html(), css(), EditorView.contentAttributes.of({ "data-enable-grammarly": "false" })]}
                                extensions={[html(), css(), EditorView.contentAttributes.of({ "data-enable-grammarly": "false" }), EditorView.lineWrapping]}
                                theme={oneDark}
                                onChange={(val) => setCode(val)}
                            />
                        </Box>
                    </div>
                    <div>
                        <Box sx={{borderRadius: "8px", height: "100%"}}>
                            <iframe
                                srcDoc={code}
                                title="preview"
                                width="100%"
                                height="100%"
                            />
                        </Box>
                    </div>
                </Split>
            </Box>
        </Box>
    )
}

export default AdminCampaignsAdd