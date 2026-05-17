import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { User, Mail, Briefcase, Hash, Shield, Key, Camera, Loader, CheckCircle2, ShieldCheck, ChevronRight } from 'lucide-react';
import api from '../services/api';
import { useLanguageStore } from '../store/languageStore';

const ProfilePage = () => {
  const { t } = useLanguageStore();
  const { user: storeUser, updateUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/profile');
      setProfile(response.data.user);
      updateUser({ ...storeUser, ...response.data.user });
    } catch (error) {
      console.error('Failed to synchronize profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert(t('profile.invalid_image'));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert(t('profile.file_size_limit'));
      return;
    }

    try {
      setUploading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result;
        const response = await api.put('/auth/profile', {
          avatar_url: base64String
        });

        setProfile(response.data.user);
        updateUser({ ...storeUser, avatar_url: base64String });

        setSuccessMsg(t('profile.image_updated'));
        setTimeout(() => setSuccessMsg(''), 3000);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Failed to upload asset:', error);
      alert(t('profile.sync_failed'));
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-xl"></div>
        <p className="text-caption-bold text-graphite uppercase tracking-widest animate-pulse">{t('profile.syncing_directory')}</p>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans p-xl">
      {/* Header Section */}
      <div className="mb-xxl">
        <h1 className="text-display-md tracking-tight mb-xs">{t('profile.identity_profile')}</h1>
        <p className="text-body-md text-charcoal">{t('profile.identity_profile_desc')}</p>
      </div>

      {successMsg && (
        <div className="mb-xl p-md bg-green-50 border border-green-100 rounded-md text-green-700 text-caption-bold flex items-center gap-sm animate-in slide-in-from-top-2">
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="bg-paper border border-fog rounded-xl shadow-floating overflow-hidden flex flex-col lg:flex-row">
        
        {/* Visual Identity Sidebar */}
        <div className="lg:w-1/3 p-xxl bg-cloud/50 border-b lg:border-b-0 lg:border-r border-fog flex flex-col items-center text-center">
          <div className="relative group cursor-pointer mb-xl" onClick={triggerFileInput}>
            <div className={`w-48 h-48 rounded-full border-4 ${uploading ? 'border-primary/20 animate-pulse' : 'border-paper shadow-soft-lift'} overflow-hidden bg-cloud relative transition-all duration-300 group-hover:scale-[1.02]`}>
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={t('profile.identity_asset')} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-primary bg-primary/5">
                  <User size={64} strokeWidth={1} />
                </div>
              )}
              
              <div className="absolute inset-0 bg-ink/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-on-ink mb-xs" size={24} />
                <span className="text-on-ink text-[10px] font-bold uppercase tracking-widest">{t('profile.replace_identification')}</span>
              </div>
            </div>
            
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          </div>

          <div className="space-y-xs">
            <span className="inline-block px-md py-xxs bg-primary text-on-ink text-[10px] font-bold uppercase tracking-widest rounded">
              {profile.role}
            </span>
            <p className="text-caption-md text-charcoal font-mono mt-sm tracking-widest">@{profile.username}</p>
          </div>
        </div>

        {/* Directory Metadata Section */}
        <div className="lg:flex-1 p-xxl">
          <div className="mb-xxl pb-xl border-b border-fog flex justify-between items-end">
            <div>
              <h2 className="text-display-sm text-ink">{profile.full_name}</h2>
              <div className="flex items-center gap-xs mt-sm">
                <ShieldCheck size={16} className="text-primary" />
                <p className="text-caption-bold text-primary uppercase tracking-widest">{t('profile.verified_participant')}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
            {[
              { icon: Mail, label: t('profile.official_correspondence'), value: profile.email, color: 'text-primary' },
              { icon: Briefcase, label: t('profile.operational_department'), value: profile.department || t('profile.unassigned'), color: 'text-ink' },
              { icon: Hash, label: t('profile.personnel_serial_code'), value: profile.employee_code || 'N/A', color: 'text-ink' },
              { icon: Shield, label: t('profile.integrity_status'), value: t('profile.active_compliance'), color: 'text-green-600' }
            ].map((item, idx) => (
              <div key={idx} className="group p-xl bg-cloud/30 rounded-md border border-transparent hover:border-fog transition-all">
                <div className="flex items-start gap-md">
                  <div className={`p-sm bg-paper rounded border border-fog shadow-sm ${item.color}`}>
                    <item.icon size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-charcoal uppercase tracking-widest mb-xxs">{item.label}</p>
                    <p className="text-body-emphasis text-ink break-all">{item.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-xxl pt-xl border-t border-fog flex flex-col sm:flex-row gap-md">
            <button className="flex-1 sm:flex-none px-xl py-sm bg-ink text-on-ink rounded-md font-bold text-caption-bold hover:bg-charcoal transition shadow-soft-lift flex items-center justify-center gap-xs">
              <Key size={16} /> {t('profile.update_security_token')}
            </button>
            <button className="flex-1 sm:flex-none px-xl py-sm bg-cloud text-ink rounded-md font-bold text-caption-bold hover:bg-fog border border-fog transition flex items-center justify-center gap-xs">
              {t('profile.synchronize_external_data')} <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
