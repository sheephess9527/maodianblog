import React, { useState, useRef, useCallback, useMemo } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality } from '@google/genai';
import { analyzeMeetingTranscript } from '../services/geminiService';
import { encode } from '../utils/audioUtils';
import { MeetingAnalysisResult, TaskItem, TaskStatus } from '../types';
import { MicIcon, StopCircleIcon, LoaderIcon, DownloadIcon, TrashIcon } from './Icons';

const MeetingAssistant: React.FC = () => {
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [transcript, setTranscript] = useState<string>('');
    const [analysisResult, setAnalysisResult] = useState<MeetingAnalysisResult | null>(null);
    const [tasks, setTasks] = useState<TaskItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'default' | 'deadline' | 'assignee'>('default');

    const sessionRef = useRef<LiveSession | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

    const stopRecordingAndCleanup = useCallback(() => {
        if (sessionRef.current) {
            sessionRef.current.close();
            sessionRef.current = null;
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if (mediaStreamSourceRef.current) {
            mediaStreamSourceRef.current.disconnect();
            mediaStreamSourceRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        setIsRecording(false);
    }, []);

    const handleStartRecording = async () => {
        setIsRecording(true);
        setError(null);
        setTranscript('');
        setAnalysisResult(null);
        setTasks([]);
        setSortBy('default');

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            const context = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            audioContextRef.current = context;

            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        console.log('Session opened.');
                        const source = context.createMediaStreamSource(stream);
                        mediaStreamSourceRef.current = source;

                        const scriptProcessor = context.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current = scriptProcessor;

                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const l = inputData.length;
                            const int16 = new Int16Array(l);
                            for (let i = 0; i < l; i++) {
                                int16[i] = inputData[i] * 32768;
                            }
                            const pcmBlob = {
                                data: encode(new Uint8Array(int16.buffer)),
                                mimeType: 'audio/pcm;rate=16000',
                            };
                            sessionPromise.then((session) => {
                                if (session) {
                                    session.sendRealtimeInput({ media: pcmBlob });
                                }
                            });
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(context.destination);
                    },
                    onmessage: (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription) {
                            const text = message.serverContent.inputTranscription.text;
                            setTranscript(prev => prev + text);
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Session error:', e);
                        setError('发生错误，录音已停止。');
                        stopRecordingAndCleanup();
                    },
                    onclose: () => {
                        console.log('Session closed.');
                    },
                },
                config: {
                    inputAudioTranscription: {},
                    responseModalities: [Modality.AUDIO],
                },
            });
            sessionRef.current = await sessionPromise;
        } catch (err) {
            console.error('Error starting recording:', err);
            setError('无法开始录音。请检查麦克风权限。');
            setIsRecording(false);
        }
    };

    const handleStopRecording = async () => {
        stopRecordingAndCleanup();
        if (transcript.trim().length > 0) {
            setIsLoading(true);
            const result = await analyzeMeetingTranscript(transcript);
            if (result) {
                setAnalysisResult(result);
                const initialTasks: TaskItem[] = result.tasks.map(task => ({
                    ...task,
                    id: `${Date.now()}-${Math.random()}`,
                    status: TaskStatus.Pending
                }));
                setTasks(initialTasks);
                setSortBy('default');
            } else {
                setError('无法分析会议记录。');
            }
            setIsLoading(false);
        }
    };

    const toggleTaskStatus = (taskId: string) => {
        setTasks(tasks.map(task =>
            task.id === taskId
                ? { ...task, status: task.status === TaskStatus.Completed ? TaskStatus.Pending : TaskStatus.Completed }
                : task
        ));
    };
    
    const handleDeleteTask = (taskId: string) => {
        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    };

    const handleExport = () => {
        if (!analysisResult) return;

        const today = new Date().toISOString().slice(0, 10);
        const filename = `会议纪要-${today}.txt`;

        let content = `# 会议纪要\n\n`;

        content += `## 核心摘要\n`;
        content += `${analysisResult.summary}\n\n`;

        content += `## 关键决策\n`;
        if (analysisResult.keyDecisions.length > 0) {
            analysisResult.keyDecisions.forEach(decision => {
                content += `- ${decision}\n`;
            });
        } else {
            content += `无\n`;
        }
        content += `\n`;

        content += `## 议题讨论摘要\n`;
        if (analysisResult.discussionTopics.length > 0) {
            analysisResult.discussionTopics.forEach(topic => {
                content += `### ${topic.topic}\n`;
                content += `${topic.summary}\n\n`;
            });
        } else {
            content += `无\n\n`;
        }
        
        content += `## 待办事项\n`;
        if (tasks.length > 0) {
            tasks.forEach(task => {
                const statusMarker = task.status === TaskStatus.Completed ? '[x]' : '[ ]';
                content += `${statusMarker} ${task.task} (负责人: ${task.assignee}, 截止日期: ${task.deadline})\n`;
            });
        } else {
            content += `无\n`;
        }

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const sortedTasks = useMemo(() => {
        if (sortBy === 'default') {
            return tasks;
        }
        const tasksCopy = [...tasks];
        if (sortBy === 'deadline') {
            tasksCopy.sort((a, b) => {
                const dateA = new Date(a.deadline);
                const dateB = new Date(b.deadline);
                if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
                    return dateA.getTime() - dateB.getTime();
                }
                return a.deadline.localeCompare(b.deadline);
            });
        } else if (sortBy === 'assignee') {
            tasksCopy.sort((a, b) => a.assignee.localeCompare(b.assignee));
        }
        return tasksCopy;
    }, [tasks, sortBy]);

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                <MicIcon className="w-8 h-8"/> 会议助手
            </h2>

            <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-blue-300">
                        {isRecording ? "正在录音..." : "准备录音"}
                    </h3>
                    <button
                        onClick={isRecording ? handleStopRecording : handleStartRecording}
                        className={`flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-lg transition-colors shadow-md text-white ${
                            isRecording 
                            ? 'bg-red-600 hover:bg-red-700' 
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        {isRecording ? <StopCircleIcon className="w-6 h-6"/> : <MicIcon className="w-6 h-6"/>}
                        {isRecording ? '停止并分析' : '开始录音'}
                    </button>
                </div>
                {error && <p className="text-red-400 mt-4">{error}</p>}
                
                <div className="mt-4 bg-gray-900 p-4 rounded-lg min-h-[10rem] max-h-[25vh] overflow-y-auto">
                    <h4 className="text-lg font-medium text-gray-400 mb-2">实时会议记录</h4>
                    <p className="text-gray-300 whitespace-pre-wrap">
                        {transcript || '开始录音后，此处将显示实时转录文本...'}
                    </p>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center p-8">
                    <LoaderIcon className="w-12 h-12 text-blue-400" />
                    <p className="ml-4 text-xl text-gray-300">正在分析会议纪要，请稍候...</p>
                </div>
            ) : analysisResult && (
                <div className="space-y-6">
                    <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-2xl font-bold text-blue-300">核心摘要</h3>
                            <button
                                onClick={handleExport}
                                className="flex items-center gap-2 px-4 py-2 font-semibold rounded-lg bg-gray-600 hover:bg-gray-500 transition-colors text-white"
                                aria-label="导出纪要"
                            >
                                <DownloadIcon className="w-5 h-5" />
                                <span>导出纪要</span>
                            </button>
                        </div>
                        <p className="text-gray-300 whitespace-pre-wrap">{analysisResult.summary}</p>
                    </div>

                    <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
                        <h3 className="text-2xl font-bold text-green-300 mb-4">关键决策</h3>
                        <ul className="list-disc list-inside space-y-2 text-gray-300">
                            {analysisResult.keyDecisions.map((decision, index) => (
                                <li key={index}>{decision}</li>
                            ))}
                        </ul>
                         {analysisResult.keyDecisions.length === 0 && <p className="text-gray-400">会议中未识别到明确的关键决策。</p>}
                    </div>

                    <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
                        <h3 className="text-2xl font-bold text-purple-300 mb-4">议题讨论摘要</h3>
                        <div className="space-y-4">
                            {analysisResult.discussionTopics.map((topic, index) => (
                                <div key={index} className="bg-gray-700/50 p-4 rounded-lg">
                                    <h4 className="font-semibold text-lg text-purple-200">{topic.topic}</h4>
                                    <p className="text-gray-300 whitespace-pre-wrap mt-1">{topic.summary}</p>
                                </div>
                            ))}
                             {analysisResult.discussionTopics.length === 0 && <p className="text-gray-400">会议中未识别到明确的讨论议题。</p>}
                        </div>
                    </div>

                    <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
                        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                            <h3 className="text-2xl font-bold text-yellow-300">待办事项</h3>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-gray-400">排序:</span>
                                <button onClick={() => setSortBy('default')} className={`px-3 py-1 rounded-full transition-colors ${sortBy === 'default' ? 'bg-yellow-400/20 text-yellow-200' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}>默认</button>
                                <button onClick={() => setSortBy('deadline')} className={`px-3 py-1 rounded-full transition-colors ${sortBy === 'deadline' ? 'bg-yellow-400/20 text-yellow-200' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}>截止日期</button>
                                <button onClick={() => setSortBy('assignee')} className={`px-3 py-1 rounded-full transition-colors ${sortBy === 'assignee' ? 'bg-yellow-400/20 text-yellow-200' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}>负责人</button>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {sortedTasks.map((item) => (
                                <div key={item.id} className="group bg-gray-700 p-4 rounded-lg flex items-center justify-between gap-4 transition-colors hover:bg-gray-600/50">
                                    <div className="flex items-center gap-4 flex-1">
                                        <input
                                            type="checkbox"
                                            checked={item.status === TaskStatus.Completed}
                                            onChange={() => toggleTaskStatus(item.id)}
                                            className="w-5 h-5 rounded bg-gray-600 border-gray-500 text-blue-500 focus:ring-blue-600 flex-shrink-0 cursor-pointer"
                                        />
                                        <div className={`flex-1 ${item.status === TaskStatus.Completed ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                                            <p className="font-semibold">{item.task}</p>
                                            <p className="text-sm">
                                                <span className="font-medium text-gray-400">负责人:</span> {item.assignee} | 
                                                <span className="font-medium text-gray-400 ml-2">截止日期:</span> {item.deadline}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteTask(item.id)}
                                        className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110"
                                        aria-label={`删除任务: ${item.task}`}
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                            {tasks.length === 0 && <p className="text-gray-400">会议中未识别到明确的待办事项。</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MeetingAssistant;