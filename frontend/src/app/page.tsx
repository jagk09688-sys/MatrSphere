'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertCircle, Check, ChevronRight, FileUp, LockKeyhole, ShieldCheck, Upload, X } from 'lucide-react';
import styles from './page.module.css';

type Profile = { id: number; full_name: string; role: string; department: string; email: string; phone: string; national_id: string; address: string; imported_at: string };
const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';
const fields: Array<[keyof Profile, string]> = [['email', 'Email address'], ['phone', 'Phone number'], ['national_id', 'National ID'], ['address', 'Home address']];

export default function Home() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selected, setSelected] = useState<Profile | null>(null);
  const [revealed, setRevealed] = useState<Profile | null>(null);
  const [consentOpen, setConsentOpen] = useState(false);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const fileInput = useRef<HTMLInputElement>(null);

  async function loadProfiles() { try { const response = await fetch(`${API}/profiles`); const data = await response.json(); setProfiles(data.profiles ?? []); if (!selected && data.profiles?.[0]) setSelected(data.profiles[0]); } catch { setStatus('API unavailable. Start the FastAPI service to load profiles.'); } finally { setLoading(false); } }
  useEffect(() => { loadProfiles(); }, []);
  async function importFile(file: File) { const form = new FormData(); form.append('file', file); setStatus('Importing encrypted records...'); try { const response = await fetch(`${API}/profiles/import`, { method: 'POST', body: form }); const data = await response.json(); if (!response.ok) throw new Error(data.detail); setStatus(`${data.imported} profiles encrypted and imported.`); await loadProfiles(); } catch (error) { setStatus(error instanceof Error ? error.message : 'Import failed.'); } }
  async function revealProfile() { if (!selected) return; setConsentOpen(false); setStatus('Requesting consented profile access...'); try { const response = await fetch(`${API}/profiles/${selected.id}/reveal`, { method: 'POST' }); const data = await response.json(); if (!response.ok) throw new Error(data.detail); setRevealed(data.profile); setStatus('Access granted for this profile.'); } catch (error) { setStatus(error instanceof Error ? error.message : 'Reveal failed.'); } }
  const visible = revealed?.id === selected?.id ? revealed : selected;

  return <main className={styles.shell}>
    <aside className={styles.sidebar}><div className={styles.brand}><div className={styles.brandMark}><ShieldCheck size={22} /></div><div><strong>Profile Vault</strong><span>PII workspace</span></div></div><div className={styles.navLabel}>Workspace</div><div className={`${styles.navItem} ${styles.active}`}><LockKeyhole size={17} /> Protected profiles <span className={styles.navCount}>{profiles.length}</span></div><div className={styles.securityNote}><ShieldCheck size={17} /><div><strong>Vault protected</strong><span>PII encrypted at rest</span></div></div></aside>
    <section className={styles.content}><header className={styles.header}><div><p className={styles.eyebrow}>SECURE DIRECTORY / 01</p><h1>Protected profiles</h1><p className={styles.subtitle}>Review imported records with privacy built into every interaction.</p></div><div className={styles.headerActions}><input ref={fileInput} type="file" accept=".csv" hidden onChange={event => event.target.files?.[0] && importFile(event.target.files[0])} /><button className={styles.uploadButton} onClick={() => fileInput.current?.click()}><Upload size={17} /> Import CSV</button><span className={styles.securePill}><LockKeyhole size={14} /> Encrypted</span></div></header>
      {status && <div className={styles.status}><AlertCircle size={16} /> {status}</div>}
      <div className={styles.workspace}><div className={styles.listPane}><div className={styles.listHeader}><span>Directory</span><span>{profiles.length} records</span></div>{loading ? <div className={styles.empty}>Loading vault...</div> : profiles.length === 0 ? <div className={styles.empty}><FileUp size={30} /><strong>No profiles yet</strong><span>Import the sample users.csv to begin.</span></div> : profiles.map(profile => <button key={profile.id} className={`${styles.profileRow} ${selected?.id === profile.id ? styles.selected : ''}`} onClick={() => { setSelected(profile); setRevealed(null); }}><span className={styles.avatar}>{profile.full_name.split(' ').map(name => name[0]).slice(0, 2).join('')}</span><span className={styles.profileMeta}><strong>{profile.full_name}</strong><small>{profile.role} · {profile.department}</small></span><ChevronRight size={16} /></button>)}</div>
        <div className={styles.detailPane}>{visible ? <><div className={styles.detailTop}><div><p className={styles.eyebrow}>PROFILE / {String(visible.id).padStart(3, '0')}</p><h2>{visible.full_name}</h2><p className={styles.role}>{visible.role} · {visible.department}</p></div><span className={revealed?.id === selected?.id ? styles.accessGranted : styles.maskedBadge}>{revealed?.id === selected?.id ? <><Check size={13} /> Revealed</> : <><LockKeyhole size={13} /> Masked</>}</span></div><div className={styles.dataGrid}>{fields.map(([key, label]) => <div className={styles.dataField} key={key}><span>{label}</span><strong>{visible[key]}</strong></div>)}</div>{revealed?.id !== selected.id && <div className={styles.consentCard}><div className={styles.consentIcon}><LockKeyhole size={19} /></div><div><strong>Protected information</strong><p>PII is hidden by default. Request temporary access to view this record.</p></div><button onClick={() => setConsentOpen(true)}>Request access</button></div>}<div className={styles.audit}><span>Imported {new Date(visible.imported_at).toLocaleDateString()}</span><span><ShieldCheck size={14} /> Access is audited</span></div></> : <div className={styles.emptyDetail}><LockKeyhole size={34} /><h2>Select a profile</h2><p>Choose a record from the directory to inspect its masked fields.</p></div>}</div></div>
    </section>
    {consentOpen && <div className={styles.modalBackdrop}><div className={styles.modal}><button className={styles.close} onClick={() => setConsentOpen(false)}><X size={18} /></button><div className={styles.modalIcon}><LockKeyhole size={23} /></div><p className={styles.eyebrow}>CONSENT REQUIRED</p><h2>Reveal protected information?</h2><p>This will decrypt and display the selected profile&apos;s PII in this session. Access is limited to this record and will be logged.</p><label className={styles.checkbox}><input type="checkbox" defaultChecked /> <span>I understand that this data is sensitive and will only use it for an authorized purpose.</span></label><button className={styles.confirm} onClick={revealProfile}>Grant temporary access <ChevronRight size={17} /></button></div></div>}
  </main>;
}
