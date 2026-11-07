import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Sparkles, CheckCircle2 } from 'lucide-react';

interface VoiceCommandAssistantProps {
  onCommandRecognized?: (intent: string, payload: any) => void;
}

export const VoiceCommandAssistant: React.FC<VoiceCommandAssistantProps> = ({
  onCommandRecognized,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState<'en-US' | 'hi-IN' | 'mr-IN'>('en-US');
  const [transcript, setTranscript] = useState('');
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognizer = new SpeechRecognition();
      recognizer.continuous = false;
      recognizer.interimResults = false;
      recognizer.lang = language;

      recognizer.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        processVoiceCommand(text);
        setIsListening(false);
      };

      recognizer.onerror = (err: any) => {
        console.warn('[VoiceAssistant] Error:', err);
        setIsListening(false);
      };

      recognizer.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognizer);
    }
  }, [language]);

  const toggleListening = () => {
    if (!recognition) {
      setResponseMessage('Speech recognition is not supported in this browser environment.');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setResponseMessage(null);
      try {
        recognition.lang = language;
        recognition.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  const processVoiceCommand = (command: string) => {
    const lower = command.toLowerCase();

    // English, Hindi & Marathi intents
    if (
      lower.includes('visitor') ||
      lower.includes('pass') ||
      lower.includes('अतिथी') ||
      lower.includes('पास') ||
      lower.includes('पाहुणे')
    ) {
      const msg =
        language === 'mr-IN'
          ? 'नवीन व्हिजिटर पास फॉर्म उघडत आहे...'
          : language === 'hi-IN'
          ? 'नया विज़िटर पास फॉर्म खोला जा रहा है...'
          : 'Opening new visitor pass generator...';
      setResponseMessage(msg);
      onCommandRecognized?.('NAVIGATE_VISITOR_PASS', { source: 'voice' });
    } else if (
      lower.includes('sos') ||
      lower.includes('emergency') ||
      lower.includes('मदत') ||
      lower.includes('मदद') ||
      lower.includes('आपत्कालीन')
    ) {
      const msg =
        language === 'mr-IN'
          ? 'आपत्कालीन SOS अलर्ट सुरू केला जात आहे!'
          : language === 'hi-IN'
          ? 'इमरजेंसी SOS अलर्ट सक्रिय किया जा रहा है!'
          : 'Triggering Emergency SOS Alert to Security...';
      setResponseMessage(msg);
      onCommandRecognized?.('TRIGGER_SOS', { source: 'voice' });
    } else if (
      lower.includes('balance') ||
      lower.includes('bill') ||
      lower.includes('पैसा') ||
      lower.includes('पैसे') ||
      lower.includes('बिल')
    ) {
      const msg =
        language === 'mr-IN'
          ? 'सोसायटी मेंटेनन्स वॉलेट आणि बिले तपासत आहे...'
          : language === 'hi-IN'
          ? 'सोसायटी मेंटेनेंस बिल और वॉलेट खोला जा रहा है...'
          : 'Retrieving your society maintenance bill & wallet balance...';
      setResponseMessage(msg);
      onCommandRecognized?.('NAVIGATE_PAYMENTS', { source: 'voice' });
    } else {
      const fallback =
        language === 'mr-IN'
          ? `आदेश प्राप्त झाला: "${command}"`
          : language === 'hi-IN'
          ? `कमांड प्राप्त हुई: "${command}"`
          : `Recognized command: "${command}"`;
      setResponseMessage(fallback);
      onCommandRecognized?.('UNKNOWN_COMMAND', { text: command });
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white shadow-xl max-w-md mx-auto my-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Sparkles size={18} />
          </div>
          <div>
            <h4 className="text-sm font-semibold">SafeGate Vernacular Voice</h4>
            <p className="text-xs text-slate-400">English • हिन्दी • मराठी</p>
          </div>
        </div>

        {/* Language Selector */}
        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg text-xs">
          <button
            onClick={() => setLanguage('en-US')}
            className={`px-2 py-0.5 rounded transition ${
              language === 'en-US' ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('hi-IN')}
            className={`px-2 py-0.5 rounded transition ${
              language === 'hi-IN' ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400'
            }`}
          >
            हिंदी
          </button>
          <button
            onClick={() => setLanguage('mr-IN')}
            className={`px-2 py-0.5 rounded transition ${
              language === 'mr-IN' ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400'
            }`}
          >
            मराठी
          </button>
        </div>
      </div>

      {/* Main Interaction Area */}
      <div className="flex items-center gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
        <button
          onClick={toggleListening}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
            isListening
              ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/40 ring-4 ring-rose-500/20'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
          }`}
          title={isListening ? 'Stop listening' : 'Start voice command'}
        >
          {isListening ? <MicOff size={22} /> : <Mic size={22} />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="text-xs text-slate-400 font-medium">
            {isListening
              ? language === 'mr-IN'
                ? 'ऐकत आहे... बोला (उदा. "पास तयार करा", "मदत SOS")'
                : language === 'hi-IN'
                ? 'सुन रहे हैं... बोलिए (उदा. "पास बनाओ", "मदद SOS")'
                : 'Listening... say "Create visitor pass", "Emergency SOS", "Pay bill"'
              : 'Tap microphone to speak'}
          </div>
          {transcript && (
            <div className="text-sm font-medium text-slate-200 truncate mt-0.5">
              "{transcript}"
            </div>
          )}
        </div>
      </div>

      {responseMessage && (
        <div className="mt-3 flex items-start gap-2 bg-emerald-950/40 border border-emerald-800/60 p-2.5 rounded-lg text-xs text-emerald-300">
          <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
          <span>{responseMessage}</span>
        </div>
      )}
    </div>
  );
};
