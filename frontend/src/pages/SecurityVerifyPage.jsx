import React, { useState, useEffect, useRef } from 'react';
import QRScanner from '../components/QRScanner';
import { accessService } from '../services/accessService';
import { 
  ShieldCheck, 
  User, 
  Laptop, 
  Smartphone, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ChevronRight,
  History,
  Info,
  Scan,
  Activity,
  Cpu
} from 'lucide-react';
import Alert from '../components/Alert';

const SecurityVerifyPage = () => {
  const [isScanning, setIsScanning] = useState(true);
  const [verificationData, setVerificationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  const [lastScanned, setLastScanned] = useState(null);

  // Audio effects
  const successAudio = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3'));
  const errorAudio = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3'));

  const playAudioSafely = (audioRef) => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => console.log('Audio playback prevented or interrupted:', err));
      }
    }
  };

  const handleScan = async (decodedText) => {
    if (loading || decodedText === lastScanned) return;
    
    setLoading(true);
    setLastScanned(decodedText);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/access/verify/${encodeURIComponent(decodedText)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Verification failed');
      }
      
      const data = await response.json();
      setVerificationData(data);
      
      if (data.verificationResult.deviceMatch === false) {
        playAudioSafely(errorAudio);
        setMessage('SECURITY BREACH: Device mismatch detected for this participant.');
        setMessageType('error');
      } else {
        playAudioSafely(successAudio);
        setMessage('Identity and asset validation successful.');
        setMessageType('success');
      }
      
      setIsScanning(false);
    } catch (err) {
      playAudioSafely(errorAudio);
      setMessage(err.message || 'Verification terminal error. System fault.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setVerificationData(null);
    setIsScanning(true);
    setLastScanned(null);
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans p-xl">
      {/* Header Section */}
      <div className="mb-xxl">
        <h1 className="text-display-md tracking-tight mb-xs">Security Verification Terminal</h1>
        <p className="text-body-md text-charcoal">Validate personnel credentials and provisioned hardware assets at laboratory ingress points.</p>
      </div>

      {message && (
        <div className="mb-xl animate-in slide-in-from-top-2">
          <Alert message={message} type={messageType} onClose={() => setMessage('')} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl">
        {/* Terminal Scanner Side */}
        <div className="bg-paper border border-fog rounded-xl shadow-floating flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden group">
           {/* Scan Overlay Effect */}
           {isScanning && (
             <div className="absolute top-0 left-0 w-full h-1 bg-primary/20 animate-[scan_3s_ease-in-out_infinite] z-20 pointer-events-none"></div>
           )}

           {isScanning ? (
              <div className="w-full max-w-md z-10 p-xxl text-center">
                 <div className="inline-flex p-md bg-cloud rounded-full text-primary mb-xl border border-fog">
                    <Scan size={32} />
                 </div>
                 <h2 className="text-display-xs text-ink mb-md">Awaiting Token Scan</h2>
                 <p className="text-caption-md text-charcoal mb-xxl">Present personnel badge or asset identity tag to the optical sensor.</p>
                 <div className="rounded-xl overflow-hidden border border-primary shadow-soft-lift bg-cloud relative">
                    <QRScanner onScanSuccess={handleScan} />
                    <div className="absolute inset-0 border-2 border-primary/20 pointer-events-none rounded-xl"></div>
                 </div>
              </div>
           ) : (
              <div className="text-center z-10 w-full p-xxl animate-in zoom-in-95 duration-300">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-xl border-4 ${verificationData?.verificationResult.deviceMatch === false ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                   {verificationData?.verificationResult.deviceMatch === false ? <XCircle size={48} /> : <CheckCircle2 size={48} />}
                </div>
                <h2 className="text-display-sm text-ink mb-xxl">Verification Sequence Result</h2>
                <button 
                  onClick={resetScanner}
                  className="px-xl py-sm bg-primary text-on-ink rounded-md font-bold hover:bg-primary-deep transition shadow-soft-lift uppercase tracking-widest text-caption-bold"
                >
                  Initiate New Verification
                </button>
              </div>
           )}
        </div>

        {/* Intelligence Side */}
        <div className="space-y-xl">
           {verificationData ? (
             <div className="bg-paper border border-fog rounded-xl shadow-floating overflow-hidden animate-in slide-in-from-right-8 duration-500">
                <div className="bg-cloud p-xl border-b border-fog flex items-center gap-xl">
                   <div className="w-16 h-16 rounded-full overflow-hidden border border-fog bg-white shrink-0">
                      {verificationData.user.avatar_url ? (
                        <img src={verificationData.user.avatar_url} className="w-full h-full object-cover" alt="User Identity" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-graphite opacity-30">
                           <User size={32} />
                        </div>
                      )}
                   </div>
                   <div>
                      <h3 className="text-body-emphasis text-ink">{verificationData.user.full_name}</h3>
                      <p className="text-caption-md text-charcoal font-mono">@{verificationData.user.username} • {verificationData.user.employee_code}</p>
                   </div>
                   <div className="ml-auto">
                      <span className={`px-sm py-xxs rounded text-[10px] font-bold uppercase tracking-widest border ${verificationData.verificationResult.isInside ? 'bg-green-50 text-green-700 border-green-200' : 'bg-cloud text-graphite border-fog'}`}>
                         {verificationData.verificationResult.isInside ? 'Currently On-Premise' : 'Off-Premise'}
                      </span>
                   </div>
                </div>

                <div className="p-xl">
                   {/* Verification Detail */}
                   {verificationData.verificationResult.scannedDevice && (
                     <div className={`mb-xl p-xl rounded-md border flex items-start gap-md ${verificationData.verificationResult.deviceMatch ? 'bg-green-50 border-green-100 text-green-900' : 'bg-red-50 border-red-100 text-red-900'}`}>
                        <div className="shrink-0 mt-xxs">
                           {verificationData.verificationResult.deviceMatch ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} className="animate-pulse" />}
                        </div>
                        <div>
                           <p className="text-[10px] font-bold uppercase tracking-widest mb-xxs opacity-60">Provisioned Asset Validation</p>
                           <p className="text-body-emphasis mb-xxs">
                              {verificationData.verificationResult.scannedDevice.brand} {verificationData.verificationResult.scannedDevice.model_name}
                           </p>
                           <p className="text-[10px] font-mono opacity-60 uppercase tracking-widest">S/N: {verificationData.verificationResult.scannedDevice.serial_number}</p>
                           {!verificationData.verificationResult.deviceMatch && (
                             <p className="mt-md font-bold text-[10px] bg-red-600 text-white px-md py-xxs rounded uppercase tracking-widest shadow-sm">
                                Protocol Violation: Asset not registered to participant
                             </p>
                           )}
                        </div>
                     </div>
                   )}

                   <div className="flex items-center gap-xs text-graphite mb-xl pb-sm border-b border-fog">
                      <Cpu size={14} />
                      <h4 className="text-[10px] font-bold uppercase tracking-widest">Authorized Physical Inventory</h4>
                   </div>
                   
                   <div className="space-y-md">
                      {verificationData.approvedDevices.map(device => {
                        const isScanned = verificationData.verificationResult.scannedDevice?.device_id === device.device_id;
                        return (
                          <div key={device.device_id} className={`p-md rounded border flex items-center justify-between transition-all ${isScanned ? 'bg-green-50 border-primary shadow-soft-lift scale-[1.01]' : 'bg-paper border-fog/50'}`}>
                             <div className="flex items-center gap-md">
                                <div className={`p-sm rounded ${isScanned ? 'bg-primary text-on-ink' : 'bg-cloud text-graphite'}`}>
                                   {device.device_type === 'Laptop' ? <Laptop size={16} /> : <Smartphone size={16} />}
                                </div>
                                <div>
                                   <p className="text-caption-bold text-ink">{device.brand} {device.model_name}</p>
                                   <p className="text-[10px] font-mono text-charcoal tracking-widest">{device.serial_number}</p>
                                </div>
                             </div>
                             {isScanned ? (
                               <div className="flex items-center text-primary font-bold text-[10px] uppercase tracking-widest">
                                  <CheckCircle2 size={14} className="mr-xxs" /> Validation Match
                               </div>
                             ) : (
                               <ChevronRight size={16} className="text-fog" />
                             )}
                          </div>
                        )
                      })}
                   </div>
                </div>
             </div>
           ) : (
             <div className="bg-paper rounded-xl border border-fog p-xxxl text-center flex flex-col items-center justify-center h-full shadow-soft-lift">
                <Activity size={48} className="text-graphite opacity-20 mb-xl" />
                <h3 className="text-body-emphasis text-ink mb-xs uppercase tracking-widest">Ready for Verification</h3>
                <p className="text-caption-md text-charcoal max-w-xs">Scan credentials or asset tags to initiate identity validation protocol.</p>
             </div>
           )}

           {/* Security Status Indicator */}
           <div className="bg-primary p-xl rounded-xl text-on-ink shadow-floating relative overflow-hidden group">
              <div className="relative z-10 flex items-center gap-xl">
                 <div className="bg-paper/10 p-md rounded-md backdrop-blur-md border border-paper/10">
                    <ShieldCheck size={32} />
                 </div>
                 <div>
                    <h3 className="text-body-emphasis uppercase tracking-widest">High Integrity Mode</h3>
                    <p className="text-caption-md text-on-ink/80 mt-xxs">Automated audit trail enabled. System operational status: NOMINAL.</p>
                 </div>
              </div>
              <div className="absolute -bottom-xl -right-xl w-32 h-32 bg-paper/5 rounded-full blur-2xl group-hover:scale-110 transition-transform"></div>
           </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan {
          0% { transform: translateY(0); }
          100% { transform: translateY(500px); }
        }
      ` }} />
    </div>
  );
};

export default SecurityVerifyPage;
