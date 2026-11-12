import { useState } from 'react';
import { BatteryCharging, Camera, Cpu, Headphones, MonitorSmartphone } from 'lucide-react';
import PhotoIdentifier from '@/components/ai/PhotoIdentifier';
import InquiryForm from '@/components/maintenance/InquiryForm';
import type { PhoneIdentification } from '@/types';

const SERVICES = [
  { icon: MonitorSmartphone, title: 'تغيير الشاشة', text: 'شاشات أصلية ومتوافقة مع ضمان على التركيب.' },
  { icon: Headphones, title: 'السماعات والميكروفون', text: 'سماعة المكالمات والسماعة الخارجية والميكروفون.' },
  { icon: BatteryCharging, title: 'البطارية ومنفذ الشحن', text: 'بطاريات أصلية وإصلاح منفذ الشحن بسرعة.' },
  { icon: Camera, title: 'الكاميرات', text: 'تغيير زجاج وعدسات الكاميرا بدقة عالية.' },
  { icon: Cpu, title: 'أعطال البرمجة', text: 'تنظيف الجهاز وحل مشاكل التشغيل والتهنيج.' },
];

export default function MaintenancePage() {
  const [deviceModel, setDeviceModel] = useState('');

  const handleIdentified = (identification: PhoneIdentification) => {
    setDeviceModel(identification.model);
    document.getElementById('inquiry')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="mb-10 max-w-2xl">
        <h1 className="text-4xl font-extrabold text-ink-100 sm:text-5xl">
          <span className="rgb-text">صيانة الموبايلات</span>
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-300">
          صوّر الموبايل وهنتعرف على موديله تلقائياً، واسأل عن سعر أي شاشة أو سماعة أو قطعة، وهيوصل استفسارك لصاحب المحل مباشرة.
        </p>
      </header>

      <section className="mb-14" aria-label="الخدمات">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {SERVICES.map((service) => {
            const Icon = service.icon;
            return (
              <li key={service.title} className="glass rounded-2xl p-5 transition hover:-translate-y-1 hover:border-neon-blue/40">
                <Icon className="mb-4 h-7 w-7 text-neon-blue" aria-hidden="true" />
                <h2 className="font-bold text-ink-100">{service.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-400">{service.text}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mb-14 grid gap-8 lg:grid-cols-[1fr_1.2fr]" aria-label="استفسار">
        <div>
          <h2 className="mb-4 text-2xl font-extrabold text-ink-100">١. صوّر الموبايل</h2>
          <PhotoIdentifier useLabel="استفسر عن قطع هذا الموديل" onIdentified={handleIdentified} />
        </div>
        <div id="inquiry" className="scroll-mt-24">
          <h2 className="mb-4 text-2xl font-extrabold text-ink-100">٢. ابعت استفسارك</h2>
          <InquiryForm deviceModel={deviceModel} onDeviceModelChange={setDeviceModel} />
        </div>
      </section>
    </div>
  );
}
