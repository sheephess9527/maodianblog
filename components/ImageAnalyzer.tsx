import React, { useState, useRef, useEffect } from 'react';
import { analyzeImage } from '../services/geminiService';
import { ImageIcon, LoaderIcon, SendIcon } from './Icons';

const ImageAnalyzer: React.FC = () => {
    const [prompt, setPrompt] = useState<string>('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [analysis, setAnalysis] =useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const analysisResultRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (analysis && !isLoading) {
            analysisResultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [analysis, isLoading]);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 4 * 1024 * 1024) { // 4MB limit
                setError('图片大小超过 4MB 限制。');
                return;
            }
            setError(null);
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = error => reject(error);
        });
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!imageFile || !prompt.trim()) {
            setError('请上传图片并输入提示。');
            return;
        }
        
        setIsLoading(true);
        setError(null);
        setAnalysis('');

        try {
            const imageBase64 = await fileToBase64(imageFile);
            const result = await analyzeImage(prompt, imageBase64, imageFile.type);
            setAnalysis(result);
        } catch (err) {
            console.error(err);
            setError('分析图像失败。请重试。');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                <ImageIcon className="w-8 h-8"/> 图像分析
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Left Panel: Image Upload and Prompt */}
                <div className="bg-gray-800 p-6 rounded-xl shadow-lg space-y-4">
                    <div className="w-full h-64 bg-gray-700 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-500">
                        {imagePreview ? (
                            <img src={imagePreview} alt="Preview" className="max-h-full max-w-full object-contain rounded-md" />
                        ) : (
                            <div className="text-center text-gray-400">
                                <ImageIcon className="w-16 h-16 mx-auto mb-2"/>
                                <p>图像预览</p>
                            </div>
                        )}
                    </div>
                    
                    <input
                        type="file"
                        id="image-upload"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handleImageChange}
                        className="hidden"
                    />
                    <label htmlFor="image-upload" className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg cursor-pointer transition-colors">
                        {imageFile ? '更换图片' : '上传图片'}
                    </label>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="您想了解关于这张图片的什么信息？"
                            className="w-full h-24 p-3 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !imageFile || !prompt}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-lg bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors shadow-md"
                        >
                            {isLoading ? <LoaderIcon className="w-5 h-5"/> : <SendIcon className="w-5 h-5"/>}
                            {isLoading ? '分析中...' : '分析图像'}
                        </button>
                    </form>
                    {error && <p className="text-red-400 text-center">{error}</p>}
                </div>
                
                {/* Right Panel: Analysis Result */}
                <div ref={analysisResultRef} className="bg-gray-800 p-6 rounded-xl shadow-lg min-h-[30rem]">
                    <h3 className="text-xl font-semibold mb-4 text-green-300">分析结果</h3>
                    <div className="bg-gray-900 p-4 rounded-lg min-h-[26rem] max-h-[50vh] overflow-y-auto text-gray-300 whitespace-pre-wrap">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <LoaderIcon className="w-8 h-8 text-green-400"/>
                            </div>
                        ) : (
                            analysis || 'AI 分析结果将显示在这里...'
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageAnalyzer;