'use client';

import React, { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Rnd } from 'react-rnd';
import { Document as PDFDocument, Page as PDFPage, pdfjs } from 'react-pdf';

interface TextBox {
    id: number;
    text: string;
    font?: string;
    fontSize?: string;
}

const A4_WIDTH = 595;
const A4_HEIGHT = 842;

const Page = () => {
    useEffect(() => {
        pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
    }, []);

    const pdfRef = useRef<HTMLDivElement | null>(null);
    const sigCanvasRef = useRef<SignatureCanvas | null>(null);

    const [textInput,
        setTextInput] = useState('');
    const [textBoxes,
        setTextBoxes] = useState<TextBox[]>([]);
    const [image,
        setImage] = useState<string | null>(null);
    const [fileName,
        setFileName] = useState('custom-pdf.pdf');
    const [imagePos,
        setImagePos] = useState({ x: 50, y: 150 });

    const [signatures,
        setSignatures] = useState<{
            id: number;
            data: string;
            pos: {
                x: number;
                y: number
            }
        }[]>([]);
    const [isDrawingSignature,
        setIsDrawingSignature] = useState(false);

    const [pdfBackground,
        setPdfBackground] = useState<string | null>(null);

    const [showPdfBackground,
        setShowPdfBackground] = useState(true);
    const [numPages,
        setNumPages] = useState<number>(1);

    const preDefinedFontOptions = ["Georgia, serif", "Arial, sans-serif", "Courier New, monospace", "'Times New Roman', serif"];
    const [selectedFont,
        setSelectedFont] = useState("Georgia, serif");

    const [selectedFontSize,
        setSelectedFontSize] = useState("14px");

    const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files
            ?.[0];
        if (!file)
            return;
        const fileURL = URL.createObjectURL(file);
        setPdfBackground(fileURL);
    };

    const addTextBox = () => {
        if (textInput.trim() === '')
            return;
        setTextBoxes((prev) => [
            ...prev, {
                id: Date.now(),
                text: textInput.trim(),
                font: selectedFont,
                fontSize: selectedFontSize
            } // updated
        ]);
        setTextInput('');
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files
            ?.[0];
        if (!file)
            return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setImage(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const saveSignature = () => {
        if (sigCanvasRef.current) {
            const dataUrl = sigCanvasRef
                .current
                .toDataURL('image/png');
            const newSignature = {
                id: Date.now(),
                data: dataUrl,
                pos: {
                    x: 50,
                    y: 300
                }
            };
            setSignatures((prev) => [
                ...prev,
                newSignature
            ]);
            setIsDrawingSignature(false);
            sigCanvasRef
                .current
                .clear();
        }
    };

    const downloadPDF = async () => {
        if (!pdfRef.current)
            return;

        // Dynamically import html2pdf only on the client
        //@ts-ignore
        const html2pdf = (await import('html2pdf.js')).default;
        const opt = {
            margin: 0,
            filename: fileName,
            image: {
                type: 'jpeg',
                quality: 0.98
            },
            html2canvas: {
                scale: 2,
                useCORS: true
            },
            jsPDF: {
                unit: 'px',
                format: [
                    A4_WIDTH, A4_HEIGHT
                ],
                orientation: 'portrait'
            }
        };
        html2pdf()
            .set(opt)
            .from(pdfRef.current)
            .save();
    };

    //Deletion helper functions
    const deleteTextBox = (id: number) => {
        setTextBoxes(prev => prev.filter(box => box.id !== id));
    };

    const deleteSignature = (id: number) => {
        setSignatures(prev => prev.filter(sig => sig.id !== id));
    };

    const deleteImage = () => {
        setImage(null);
    };

    return (
        <div
            style={{
                padding: 20,
                fontFamily: 'Arial, sans-serif'
            }}>
            <h2
                style={{
                    textAlign: 'center',
                    marginBottom: 30,
                    color: '#333'
                }}>PDF Editor</h2>

            {/* Toolbar */}
            <div
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 20,
                    padding: 20,
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #dee2e6',
                    borderRadius: 8,
                    marginBottom: 30,
                    alignItems: 'flex-start'
                }}>
                {/* Text Section */}
                <div
                    style={{
                        minWidth: 200,
                        flex: 1
                    }}>
                    <label
                        style={{
                            display: 'block',
                            marginBottom: 8,
                            fontWeight: 'bold',
                            color: '#495057'
                        }}>
                        Add Text
                    </label>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 10
                        }}>
                        <textarea
                            value={textInput}
                            placeholder="Type your text"
                            onChange={(e) => setTextInput(e.target.value)}
                            style={{
                                flex: 1,
                                padding: 8,
                                border: '1px solid #ced4da',
                                borderRadius: 4,
                                fontSize: 14,
                                resize: 'vertical'
                            }}
                            rows={3} /> {/* Dropdown to select font */}
                        <select
                            value={selectedFont}
                            onChange={(e) => {
                                setSelectedFont(e.target.value);
                            }}
                            style={{
                                padding: 8,
                                border: '1px solid #ced4da',
                                borderRadius: 4,
                                fontSize: 14,
                                backgroundColor: 'white',
                                color: '#495057'
                            }}>
                            <option value="">-- Select a Font --</option>
                            {preDefinedFontOptions.map((option) => (
                                <option
                                    key={option}
                                    value={option}
                                    style={{
                                        fontFamily: option
                                    }}>
                                    {option}
                                </option>
                            ))}
                        </select>
                        {/* Dropdown to select font size */}
                        <select
                            value={selectedFontSize}
                            onChange={(e) => {
                                setSelectedFontSize(e.target.value);
                            }}
                            style={{
                                padding: 8,
                                border: '1px solid #ced4da',
                                borderRadius: 4,
                                fontSize: 14,
                                backgroundColor: 'white',
                                color: '#495057'
                            }}>
                            <option value="12px">12px</option>
                            <option value="14px">14px</option>
                            <option value="16px">16px</option>
                            <option value="18px">18px</option>
                            <option value="20px">20px</option>
                        </select>
                        <button
                            onClick={addTextBox}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: 4,
                                cursor: 'pointer',
                                fontSize: 14,
                                fontWeight: 'bold'
                            }}>
                            Add
                        </button>
                    </div>
                </div>

                {/* File Uploads Section */}
                <div style={{
                    minWidth: 200
                }}>
                    <label
                        style={{
                            display: 'block',
                            marginBottom: 8,
                            fontWeight: 'bold',
                            color: '#495057'
                        }}>
                        Upload PDF Background
                    </label>
                    <div style={{
                        marginBottom: 16
                    }}>
                        <small
                            style={{
                                color: '#6c757d',
                                display: 'block',
                                marginBottom: 4
                            }}>
                            Select a PDF to use as background
                        </small>
                        <input
                            type="file"
                            accept="application/pdf"
                            onChange={handlePdfUpload}
                            style={{
                                padding: 6,
                                border: '1px solid #ced4da',
                                borderRadius: 4,
                                fontSize: 12,
                                width: '100%'
                            }} />
                    </div>

                    <label
                        style={{
                            display: 'block',
                            marginBottom: 8,
                            fontWeight: 'bold',
                            color: '#495057'
                        }}>
                        Upload Image
                    </label>
                    <div>
                        <small
                            style={{
                                color: '#6c757d',
                                display: 'block',
                                marginBottom: 4
                            }}>
                            Add an image overlay to the PDF
                        </small>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            style={{
                                padding: 6,
                                border: '1px solid #ced4da',
                                borderRadius: 4,
                                fontSize: 12,
                                width: '100%'
                            }} />
                    </div>
                </div>

                {/* Signature Section */}
                <div style={{
                    minWidth: 200
                }}>
                    <label
                        style={{
                            display: 'block',
                            marginBottom: 8,
                            fontWeight: 'bold',
                            color: '#495057'
                        }}>
                        Signature
                    </label>
                    {isDrawingSignature
                        ? (
                            <div>
                                <SignatureCanvas
                                    ref={sigCanvasRef}
                                    penColor="black"
                                    canvasProps={{
                                        width: 250,
                                        height: 80,
                                        style: {
                                            border: '1px solid #ced4da',
                                            borderRadius: 4
                                        }
                                    }} />
                                <div
                                    style={{
                                        display: 'flex',
                                        gap: 8,
                                        marginTop: 8
                                    }}>
                                    <button
                                        onClick={saveSignature}
                                        style={{
                                            padding: '6px 12px',
                                            backgroundColor: '#28a745',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: 4,
                                            cursor: 'pointer',
                                            fontSize: 12
                                        }}>
                                        Save
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsDrawingSignature(false);
                                            sigCanvasRef.current
                                                ?.clear();
                                        }}
                                        style={{
                                            padding: '6px 12px',
                                            backgroundColor: '#6c757d',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: 4,
                                            cursor: 'pointer',
                                            fontSize: 12
                                        }}>
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )
                        : (
                            <button
                                onClick={() => setIsDrawingSignature(true)}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#17a2b8',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 4,
                                    cursor: 'pointer',
                                    fontSize: 14,
                                    fontWeight: 'bold'
                                }}>
                                Add Signature
                            </button>
                        )}
                </div>

                {/* PDF Settings Section */}
                <div style={{
                    minWidth: 200
                }}>
                    <label
                        style={{
                            display: 'block',
                            marginBottom: 8,
                            fontWeight: 'bold',
                            color: '#495057'
                        }}>
                        PDF Settings
                    </label>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 8
                        }}>
                        <input
                            type="text"
                            placeholder="Enter file name"
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                            style={{
                                padding: 8,
                                border: '1px solid #ced4da',
                                borderRadius: 4,
                                fontSize: 14
                            }} />
                        <div
                            style={{
                                display: 'flex',
                                gap: 8
                            }}>
                            <button
                                onClick={downloadPDF}
                                style={{
                                    padding: '10px 16px',
                                    backgroundColor: '#dc3545',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 4,
                                    cursor: 'pointer',
                                    fontSize: 14,
                                    fontWeight: 'bold',
                                    flex: 1
                                }}>
                                Download PDF
                            </button>
                            <button
                                onClick={() => setShowPdfBackground((prev) => !prev)}
                                style={{
                                    padding: '8px 12px',
                                    backgroundColor: showPdfBackground
                                        ? '#ffc107'
                                        : '#28a745',
                                    color: showPdfBackground
                                        ? '#212529'
                                        : 'white',
                                    border: 'none',
                                    borderRadius: 4,
                                    cursor: 'pointer',
                                    fontSize: 12,
                                    fontWeight: 'bold'
                                }}>
                                {showPdfBackground
                                    ? 'Hide'
                                    : 'Show'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* PDF Preview */}
            <div
                ref={pdfRef}
                style={{
                    width: A4_WIDTH,
                    height: numPages * A4_HEIGHT,
                    backgroundColor: 'white',
                    border: '2px solid #dee2e6',
                    borderRadius: 8,
                    margin: '0 auto',
                    position: 'relative',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}>
                {/* PDF Background Container */}
                {showPdfBackground && pdfBackground && (
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            zIndex: 1,
                            pointerEvents: 'none',
                            opacity: 1
                        }}>
                        <PDFDocument
                            file={pdfBackground}
                            onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
                            {Array.from(new Array(numPages), (_, index) => (<PDFPage
                                key={`page_${index + 1}`}
                                pageNumber={index + 1}
                                width={A4_WIDTH}
                                renderMode="canvas"
                                renderTextLayer={false}
                                renderAnnotationLayer={false} />))}
                        </PDFDocument>
                    </div>
                )}
                {/* Overlay Container */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: 10
                    }}>
                    {textBoxes.map((box) => (
                        <Rnd key={box.id} default={{
                            x: 50,
                            y: 50,
                            width: 200,
                            height: 50
                        }} // NEW: default dimension for text box
                            bounds="parent" enableResizing={{
                                top: true,
                                right: true,
                                bottom: true,
                                left: true,
                                topRight: true,
                                bottomRight: true,
                                bottomLeft: true,
                                topLeft: true
                            }}>
                            <div
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    backgroundColor: '#f0f0f0',
                                    padding: '4px 8px',
                                    borderRadius: 4,
                                    whiteSpace: 'pre-wrap',
                                    fontFamily: box.font,
                                    fontSize: box.fontSize,
                                    position: 'relative'
                                }}>
                                {box.text}
                                {/* Delete button for text box */}
                                <button
                                    onClick={() => deleteTextBox(box.id)}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        background: 'red',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: 20,
                                        height: 20,
                                        cursor: 'pointer'
                                    }}>
                                    &times;
                                </button>
                            </div>
                        </Rnd>
                    ))}
                    {image && (
                        <Rnd position={imagePos} bounds="parent" onDragStop={(e, d) => setImagePos({ x: d.x, y: d.y })} default={{
                            x: imagePos.x,
                            y: imagePos.y,
                            width: 150,
                            height: 150
                        }} // NEW: default dimension for image
                            enableResizing={{
                                top: true,
                                right: true,
                                bottom: true,
                                left: true,
                                topRight: true,
                                bottomRight: true,
                                bottomLeft: true,
                                topLeft: true
                            }}>
                            <div
                                style={{
                                    position: 'relative',
                                    display: 'inline-block',
                                    width: '100%',
                                    height: '100%'
                                }}>
                                <img
                                    src={image}
                                    alt="Uploaded"
                                    style={{
                                        width: '100%',
                                        height: '100%'
                                    }} /> {/* Delete button for image */}
                                <button
                                    onClick={deleteImage}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        background: 'red',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: 20,
                                        height: 20,
                                        cursor: 'pointer'
                                    }}>
                                    &times;
                                </button>
                            </div>
                        </Rnd>
                    )}
                    {signatures.map((sig) => (
                        <Rnd key={sig.id} position={sig.pos} bounds="parent" onDrag={(e, d) => setSignatures((prev) => prev.map((item) => item.id === sig.id
                            ? {
                                ...item,
                                pos: {
                                    x: d.x,
                                    y: d.y
                                }
                            }
                            : item))} default={{
                                x: sig.pos.x,
                                y: sig.pos.y,
                                width: 200,
                                height: 100
                            }} // NEW: default dimension for signature
                            enableResizing={{
                                top: true,
                                right: true,
                                bottom: true,
                                left: true,
                                topRight: true,
                                bottomRight: true,
                                bottomLeft: true,
                                topLeft: true
                            }}>
                            <div
                                style={{
                                    position: 'relative',
                                    display: 'inline-block',
                                    width: '100%',
                                    height: '100%'
                                }}>
                                <img
                                    src={sig.data}
                                    alt="Signature"
                                    style={{
                                        width: '100%',
                                        height: '100%'
                                    }} /> {/* Delete button for signature */}
                                <button
                                    onClick={() => deleteSignature(sig.id)}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        background: 'red',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: 20,
                                        height: 20,
                                        cursor: 'pointer'
                                    }}>
                                    &times;
                                </button>
                            </div>
                        </Rnd>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Page;
