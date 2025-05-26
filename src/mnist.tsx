import { useRef, useEffect, useState } from 'react'
import * as tf from '@tensorflow/tfjs'

export default function MNIST() {
    
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const tempCanvasRef = useRef<HTMLCanvasElement>(null)
    const predRef = useRef<HTMLDivElement>(null)

    const [model, setModel] = useState<tf.LayersModel | null>(null)
    const [prediction, setPrediction] = useState(null)
    const [mouseDown, setMouseDown] = useState<boolean>(false)

    // Load model on mount
    useEffect(() => {
        tf.loadLayersModel("https://xbdrcx.github.io/react-mnist/model/mnist_model.json")
        .then((loadedModel) => {
            setModel(loadedModel);
            console.log("Model loaded!");
        })
        .catch((err) => {
            console.error("Model failed to load", err);
        });
        if (tempCanvasRef.current) {
            tempCanvasRef.current.width = 28;
            tempCanvasRef.current.height = 28;
        }
    }, []);

    // Resize canvas when window changes
    useEffect(() => {
        const handleResize = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            const rect = canvas.getBoundingClientRect();
            const dpRatio = window.devicePixelRatio;
            canvas.width = rect.width * dpRatio;
            canvas.height = rect.height * dpRatio;
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        };
        window.addEventListener("resize", handleResize);
        handleResize(); // initial
        return () => window.removeEventListener("resize", handleResize);
    }, [])
    
    // Prediction logic
    const predictionHandler = () => {
        const canvas = canvasRef.current;
        if (!canvas || !tempCanvasRef.current) return;
        const tempCtx = tempCanvasRef.current.getContext("2d");
        if (!tempCtx) return;
        tempCtx.drawImage(canvas, 0, 0, 28, 28);
        const imageData = tempCtx.getImageData(0, 0, 28, 28);
        const data = imageData.data;
        const grayscaleChannel = new Uint8ClampedArray(28 * 28);
        for (let i = 0; i < data.length; i += 4) {
        grayscaleChannel[i / 4] = data[i];
        }
        if (model) {
            // Normalize and reshape the input for the model
            const input = tf.tensor(grayscaleChannel, [1, 28 * 28]).div(255.0);
            const output = model.predict(input) as tf.Tensor;
            output.array().then((preds: any) => {
                const predValue = preds[0].indexOf(Math.max(...preds[0]));
                console.log("Prediction array:", preds[0], "Predicted value:", predValue);
                setPrediction(predValue);
            });
            input.dispose();
            output.dispose();
        }
    };

    // Mouse events
    const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        setMouseDown(true);
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const rect = canvas.getBoundingClientRect();
        ctx.beginPath();
        ctx.lineWidth = 15;
        ctx.moveTo(e.nativeEvent.clientX - rect.left, e.nativeEvent.clientY - rect.top);
    };

    const onMouseUp = () => {
        setMouseDown(false);
        predictionHandler();
    };

    const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (mouseDown) {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            const rect = canvas.getBoundingClientRect();
            ctx.strokeStyle = "white";
            ctx.lineTo(e.nativeEvent.clientX - rect.left, e.nativeEvent.clientY - rect.top);
            ctx.stroke();
        }
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        setPrediction(null);
    };

    return (
        <>
            <canvas
                id='board'
                ref={canvasRef}
                width={280}
                height={280}
                style={{ border: "1px solid #000" }}
                onMouseDown={onMouseDown}
                onMouseUp={onMouseUp}
                onMouseMove={onMouseMove}
            />
            <canvas
                ref={tempCanvasRef}
                width={28}
                height={28}
                style={{ display: "none" }}
            />
            <div className='buttons'>
                <button onClick={clearCanvas}>Clear</button>
                <div id="pred" ref={predRef} style={{ opacity: prediction !== null ? 1 : 0 }}>
                    {prediction !== null ? "Prediction: " : ""}{prediction !== null ? prediction : ""}
                </div>
            </div>
        </>
    )    
}