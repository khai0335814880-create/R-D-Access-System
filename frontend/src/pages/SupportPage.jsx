import React, { useState } from 'react';
import { HelpCircle, Phone, Mail, MessageSquare, AlertCircle, Server, CheckCircle, ChevronRight, Send, Activity } from 'lucide-react';
import { useLanguageStore } from '../store/languageStore';

const SupportPage = () => {
    const { t } = useLanguageStore();
    const [ticketSent, setTicketSent] = useState(false);
    const [ticketData, setTicketData] = useState({ title: '', desc: '' });

    const contacts = [
        {
            role: t('support.technical_support_it'),
            name: "Tran Diem Quynh",
            phone: "+84 901 234 567",
            email: "support.rd@company.com",
            available: t('support.response_247')
        },
        {
            role: t('support.facility_management'),
            name: "Doan Phuong Ninh",
            phone: "+84 902 345 678",
            email: "admin.rd@company.com",
            available: t('support.business_hours')
        },
        {
            role: t('support.site_security'),
            name: "Rapid Response Team",
            phone: "Internal: 113",
            email: "security@company.com",
            available: t('support.emergency_only')
        }
    ];

    const handleSendTicket = (e) => {
        e.preventDefault();
        if (!ticketData.title || !ticketData.desc) return;
        setTicketSent(true);
        setTicketData({ title: '', desc: '' });
        setTimeout(() => setTicketSent(false), 3000);
    };

    return (
        <div className="min-h-screen bg-canvas text-ink font-sans p-xl">
            {/* Header Section */}
            <div className="mb-xxl">
                <h1 className="text-display-md tracking-tight mb-xs">{t('support.technical_support_portal')}</h1>
                <p className="text-body-md text-charcoal">{t('support.support_portal_desc')}</p>
            </div>

            {/* System Status Dashboard */}
            <div className="mb-xl bg-paper border border-fog p-xl rounded-xl shadow-floating flex flex-wrap items-center justify-between gap-xl">
                <div className="flex items-center gap-xl">
                    <div className="p-sm bg-primary/5 text-primary rounded-md border border-primary/10">
                        <Activity size={24} />
                    </div>
                    <div>
                        <h3 className="text-body-emphasis text-ink uppercase tracking-widest">{t('support.system_health_matrix')}</h3>
                        <p className="text-caption-md text-charcoal">{t('support.system_health_desc')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-xl">
                    <div className="flex items-center gap-xs">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold text-green-700 uppercase tracking-widest">{t('support.core_node_operational')}</span>
                    </div>
                    <div className="flex items-center gap-xs">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold text-green-700 uppercase tracking-widest">{t('support.db_cluster_sync')}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-xl mb-xxl">
                {contacts.map((contact, idx) => (
                    <div key={idx} className="bg-paper border border-fog p-xl rounded-xl shadow-soft-lift transition-all duration-300 hover:border-primary group">
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-xxs">{contact.role}</p>
                        <h2 className="text-body-emphasis text-ink mb-xl">{contact.name}</h2>

                        <div className="space-y-md text-caption-md text-charcoal">
                            <div className="flex items-center gap-md">
                                <div className="p-xs bg-cloud rounded text-graphite group-hover:text-primary transition-colors">
                                    <Phone size={14} />
                                </div>
                                <span>{contact.phone}</span>
                            </div>
                            <div className="flex items-center gap-md">
                                <div className="p-xs bg-cloud rounded text-graphite group-hover:text-primary transition-colors">
                                    <Mail size={14} />
                                </div>
                                <span className="truncate">{contact.email}</span>
                            </div>
                            <div className="flex items-center gap-md">
                                <div className="p-xs bg-cloud rounded text-graphite group-hover:text-primary transition-colors">
                                    <MessageSquare size={14} />
                                </div>
                                <span className="px-xs py-xxs bg-cloud border border-fog rounded text-[10px] font-bold uppercase tracking-widest">{contact.available}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Support Ticket Section */}
            <div className="bg-paper border border-fog p-xxl rounded-xl shadow-floating relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                
                <div className="flex items-center gap-xl mb-xxl relative z-10">
                    <div className="p-sm bg-primary text-on-ink rounded-md shadow-soft-lift">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <h3 className="text-display-xs text-ink">{t('support.service_request_terminal')}</h3>
                        <p className="text-caption-md text-charcoal">{t('support.service_request_desc')}</p>
                    </div>
                </div>

                {ticketSent ? (
                    <div className="p-xl bg-green-50 border border-green-100 rounded-md text-green-700 flex flex-col items-center justify-center gap-md animate-in zoom-in-95">
                        <div className="p-md bg-white rounded-full shadow-sm">
                            <CheckCircle size={32} className="text-green-500 animate-bounce" />
                        </div>
                        <p className="text-caption-bold uppercase tracking-widest">{t('support.ticket_transmitted')}</p>
                        <p className="text-caption-md text-green-600/80 italic">{t('support.ticket_transmitted_desc')}</p>
                    </div>
                ) : (
                    <form onSubmit={handleSendTicket} className="space-y-xl relative z-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
                            <div className="space-y-xs">
                                <label className="text-[10px] font-bold text-ink uppercase tracking-widest">{t('support.incident_classification')}</label>
                                <input
                                    type="text"
                                    value={ticketData.title}
                                    onChange={(e) => setTicketData({ ...ticketData, title: e.target.value })}
                                    placeholder={t('support.incident_placeholder')}
                                    className="w-full px-md py-sm bg-cloud border border-fog rounded-md text-body-md outline-none focus:border-primary transition-colors font-medium"
                                    required
                                />
                            </div>
                            <div className="md:col-span-2 space-y-xs">
                                <label className="text-[10px] font-bold text-ink uppercase tracking-widest">{t('support.anomaly_description')}</label>
                                <textarea
                                    rows="4"
                                    value={ticketData.desc}
                                    onChange={(e) => setTicketData({ ...ticketData, desc: e.target.value })}
                                    placeholder={t('support.anomaly_placeholder')}
                                    className="w-full px-md py-sm bg-cloud border border-fog rounded-md text-body-md outline-none focus:border-primary transition-colors font-medium resize-none"
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="bg-primary hover:bg-primary-deep text-on-ink px-xl py-sm rounded-md font-bold text-caption-bold uppercase tracking-widest transition shadow-soft-lift flex items-center gap-md active:scale-[0.98]"
                            >
                                {t('support.transmit_ticket')} <Send size={16} />
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default SupportPage;
