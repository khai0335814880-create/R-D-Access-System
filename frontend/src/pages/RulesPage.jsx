import React, { useState } from 'react';
import { ShieldAlert, CheckCircle, AlertTriangle, Lock, HelpCircle, ChevronDown, ChevronUp, ShieldCheck, Info, ChevronRight } from 'lucide-react';
import { useLanguageStore } from '../store/languageStore';

const RulesPage = () => {
    const { t } = useLanguageStore();
    const [agreed, setAgreed] = useState(false);
    const [openFaq, setOpenFaq] = useState(null);

    const rules = [
        {
            category: t('rules.hardware_protocol'),
            icon: Lock,
            color: "text-primary",
            bg: "bg-primary/5",
            items: [
                t('rules.rule_asset_provisioning'),
                t('rules.rule_qr_tags'),
                t('rules.rule_external_storage')
            ]
        },
        {
            category: t('rules.data_integrity'),
            icon: ShieldAlert,
            color: "text-ink",
            bg: "bg-cloud",
            items: [
                t('rules.rule_recording'),
                t('rules.rule_confidential'),
                t('rules.rule_terminal_lock')
            ]
        },
        {
            category: t('rules.facility_compliance'),
            icon: CheckCircle,
            color: "text-green-600",
            bg: "bg-green-50",
            items: [
                t('rules.rule_scan_credentials'),
                t('rules.rule_escort'),
                t('rules.rule_directives')
            ]
        }
    ];

    const faqs = [
        {
            q: t('rules.faq_asset_q'),
            a: t('rules.faq_asset_a')
        },
        {
            q: t('rules.faq_personal_q'),
            a: t('rules.faq_personal_a')
        },
        {
            q: t('rules.faq_lost_q'),
            a: t('rules.faq_lost_a')
        }
    ];

    return (
        <div className="min-h-screen bg-canvas text-ink font-sans p-xl">
            {/* Header Section */}
            <div className="mb-xxl">
                <h1 className="text-display-md tracking-tight mb-xs">{t('rules.operational_regulations')}</h1>
                <p className="text-body-md text-charcoal">{t('rules.operational_regulations_desc')}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
                {rules.map((section, idx) => (
                    <div key={idx} className="bg-paper border border-fog p-xl rounded-xl shadow-soft-lift transition-all duration-300 hover:border-primary">
                        <div className="flex items-center mb-xl">
                            <div className={`p-sm ${section.bg} ${section.color} rounded-md mr-md border border-fog/50`}>
                                <section.icon size={20} />
                            </div>
                            <h2 className="text-body-emphasis text-ink uppercase tracking-widest">{section.category}</h2>
                        </div>
                        <ul className="space-y-md">
                            {section.items.map((item, i) => (
                                <li key={i} className="flex items-start text-caption-md text-charcoal leading-relaxed">
                                    <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 mr-sm shrink-0" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            {/* FAQ Section */}
            <div className="mt-xxl bg-paper border border-fog p-xxl rounded-xl shadow-floating">
                <div className="flex items-center gap-sm mb-xxl text-primary">
                    <HelpCircle size={24} />
                    <h2 className="text-display-xs text-ink">{t('rules.faq_title')}</h2>
                </div>
                <div className="space-y-md">
                    {faqs.map((faq, idx) => (
                        <div key={idx} className="border-b border-fog pb-md last:border-0">
                            <button
                                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                className="w-full flex justify-between items-center text-left font-bold text-ink hover:text-primary transition-colors py-sm text-body-md"
                            >
                                <span>{faq.q}</span>
                                {openFaq === idx ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </button>
                            {openFaq === idx && (
                                <div className="mt-sm p-md bg-cloud border-l-4 border-primary rounded-r-md animate-in slide-in-from-left-2">
                                    <p className="text-caption-md text-charcoal leading-relaxed italic">
                                        {faq.a}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Violation Warning */}
            <div className="mt-xl p-xl bg-red-50 border border-red-100 rounded-xl flex flex-col md:flex-row items-center gap-md text-center md:text-left">
                <div className="p-md bg-white rounded-full text-red-600 shadow-sm border border-red-100 shrink-0">
                    <AlertTriangle size={24} className="animate-pulse" />
                </div>
                <div>
                    <p className="text-caption-bold text-red-700 uppercase tracking-widest mb-xxs">{t('rules.violation_warning')}</p>
                    <p className="text-caption-md text-red-600/80 font-medium leading-relaxed">
                        {t('rules.violation_desc')}
                    </p>
                </div>
            </div>

            {/* Commitment Action */}
            <div className="mt-xxl flex justify-center">
                <button
                    onClick={() => setAgreed(!agreed)}
                    className={`px-xxl py-md rounded-md font-bold transition-all shadow-soft-lift flex items-center gap-sm text-caption-bold uppercase tracking-widest ${
                        agreed
                            ? 'bg-green-600 text-on-ink border border-green-700'
                            : 'bg-primary text-on-ink hover:bg-primary-deep'
                    }`}
                >
                    {agreed ? <ShieldCheck size={20} /> : <Info size={20} />}
                    {agreed ? t('rules.compliance_certified') : t('rules.commit_compliance')}
                </button>
            </div>
        </div>
    );
};

export default RulesPage;
