import React, { useState, useCallback, useRef } from 'react';
import { transcribeMedia, generateQuestions } from './services/geminiService';
import { QAItem, Status } from './types';
import FileUpload from './components/FileUpload';
import Loader from './components/Loader';
import QATable from './components/QATable';
import { DownloadIcon, SparklesIcon, TranscriptIcon } from './components/Icons';
import { convertJsonToExcel } from './utils/excelUtils';

declare const XLSX: any;

export default function App(): React.ReactElement {
  const [status, setStatus] = useState<Status>(Status.IDLE);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaSrc, setMediaSrc] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  const [qaData, setQaData] = useState<QAItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const mediaRef = useRef<HTMLAudioElement | HTMLVideoElement>(null);

  const resetState = () => {
    setStatus(Status.IDLE);
    setMediaFile(null);
    setMediaSrc(null);
    setTranscript('');
    setQaData([]);
    setError(null);
  };
  
  const handleFileChange = useCallback(async (file: File | null) => {
    if (!file) {
      resetState();
      return;
    }

    resetState();
    setMediaFile(file);
    setMediaSrc(URL.createObjectURL(file));

    try {
      setStatus(Status.TRANSCRIBING);
      
      const reader = new FileReader();
      reader.readAsDataURL(file);
      await new Promise<void>((resolve, reject) => {
        reader.onload = async () => {
          try {
            const base64Media = (reader.result as string).split(',')[1];
            const generatedTranscript = await transcribeMedia(base64Media, file.type);
            setTranscript(generatedTranscript);

            setStatus(Status.GENERATING_QA);
            const generatedQuestions = await generateQuestions(generatedTranscript);
            setQaData(generatedQuestions.map((item, index) => ({ ...item, step: index + 1 })));
            
            setStatus(Status.COMPLETE);
            resolve();
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = (error) => reject(error);
      });

    } catch (err: any) {
      console.error(err);
      setError(`An error occurred: ${err.message || 'Please try again.'}`);
      setStatus(Status.ERROR);
    }
  }, []);

  const handleDownload = () => {
    if (qaData.length > 0) {
      const dataToExport = qaData.map(({ step, question, answer }) => ({
        "Step": `Step ${step}`,
        "Question": question,
        "Answer": answer
      }));
      convertJsonToExcel(dataToExport, "Training_Module.xlsx");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-300">
      <main className="container mx-auto max-w-4xl px-4 py-8 md:py-12">
        <header className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-100">
            AI Training Module Generator
          </h1>
          <p className="mt-4 text-lg text-slate-400">
            Upload an audio or video file to automatically generate a Q&A training guide.
          </p>
        </header>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-xl p-6 md:p-8 space-y-8">
          <FileUpload onFileSelect={handleFileChange} disabled={status !== Status.IDLE && status !== Status.COMPLETE && status !== Status.ERROR} />

          {mediaSrc && mediaFile && (
            <div className="border-t border-slate-700 pt-6">
              <h3 className="text-lg font-semibold text-slate-200 mb-3">Media Preview</h3>
              {mediaFile.type.startsWith('video/') ? (
                 <video ref={mediaRef as React.RefObject<HTMLVideoElement>} controls src={mediaSrc} className="w-full rounded-lg">
                    Your browser does not support the video element.
                 </video>
              ) : (
                <audio ref={mediaRef as React.RefObject<HTMLAudioElement>} controls src={mediaSrc} className="w-full">
                  Your browser does not support the audio element.
                </audio>
              )}
            </div>
          )}

          {status !== Status.IDLE && (
            <div className="flex items-center justify-center p-6 bg-slate-700/50 rounded-lg">
              {status === Status.TRANSCRIBING && <Loader text="Transcribing media, this may take a moment..." />}
              {status === Status.GENERATING_QA && <Loader text="Generating Q&A module with Gemini..." />}
              {status === Status.COMPLETE && (
                <div className="text-center text-green-400">
                  <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <p className="font-semibold">Processing Complete!</p>
                </div>
              )}
               {status === Status.ERROR && error && (
                <div className="text-center text-red-400">
                   <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <p className="font-semibold">An Error Occurred</p>
                  <p className="text-sm">{error}</p>
                </div>
              )}
            </div>
          )}

          {transcript && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                <TranscriptIcon />
                Transcript
              </h2>
              <textarea
                readOnly
                value={transcript}
                className="w-full h-48 p-4 bg-slate-700 border border-slate-600 rounded-lg resize-none text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Transcript"
              />
            </div>
          )}

          {qaData.length > 0 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                  <SparklesIcon />
                  Generated Q&A Module
                </h2>
                <button
                  onClick={handleDownload}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                >
                  <DownloadIcon />
                  Download Excel
                </button>
              </div>
              <QATable data={qaData} />
            </div>
          )}
        </div>
        <footer className="text-center mt-8 text-sm text-slate-500">
          <p>Powered by Google Gemini</p>
        </footer>
      </main>
    </div>
  );
}