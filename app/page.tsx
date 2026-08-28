'use client';

import { FormEvent, useEffect, useState } from 'react';

type CheckInResult = {
  name: string;
  session: string;
  time: string;
};

export default function Home() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [todayTotal, setTodayTotal] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/attendance')
      .then((response) => response.json())
      .then((data: { total?: number }) => setTodayTotal(data.total ?? 0))
      .catch(() => setTodayTotal(null));
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: data.get('name'),
          participantId: data.get('participantId'),
          team: data.get('team'),
          session: data.get('session'),
          consent: data.get('consent') === 'on',
        }),
      });
      const payload = (await response.json()) as CheckInResult & { message?: string };
      if (!response.ok) throw new Error(payload.message || 'Absensi belum berhasil disimpan.');

      setResult(payload);
      setTodayTotal((current) => (current ?? 0) + 1);
      form.reset();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Absensi belum berhasil disimpan.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="site-shell">
      <section className="hero" aria-labelledby="page-title">
        <nav className="topbar" aria-label="Navigasi utama">
          <a className="brand" href="#top" aria-label="Basic Training & Tools Usher">
            <span className="brand-mark" aria-hidden="true">BT</span>
            <span>Usher Development</span>
          </a>
          <span className="live-badge"><i /> Absensi aktif</span>
        </nav>

        <div className="hero-copy" id="top">
          <p className="eyebrow">LEARNING SESSION · 2026</p>
          <h1 id="page-title">Basic Training <span>&amp;</span><br />Tools Usher</h1>
          <p className="hero-note">
            Catat kehadiranmu. Siapkan hati untuk melayani dengan sigap, hangat,
            dan penuh perhatian.
          </p>
          <div className="session-meta">
            <div>
              <span className="meta-icon">01</span>
              <p><b>Hari ini</b><small>Check-in dibuka</small></p>
            </div>
            <div>
              <span className="meta-icon">02</span>
              <p>
                <b>{todayTotal === null ? 'Database online' : `${todayTotal} peserta hadir`}</b>
                <small>Tersimpan otomatis</small>
              </p>
            </div>
          </div>
        </div>

        <div className="steps" aria-label="Proses absensi">
          <span className={!result ? 'active' : ''}>01 <b>Isi data</b></span>
          <span className={result ? 'active' : ''}>02 <b>Konfirmasi</b></span>
          <span className={result ? 'active' : ''}>03 <b>Selesai</b></span>
        </div>
      </section>

      <section className="form-panel" aria-labelledby="form-title">
        {result ? (
          <div className="success-card" role="status" aria-live="polite">
            <span className="success-mark" aria-hidden="true">✓</span>
            <p className="eyebrow">KEHADIRAN TERCATAT</p>
            <h2 id="form-title">Sampai jumpa<br />di dalam kelas.</h2>
            <p className="success-greeting">
              Terima kasih, <b>{result.name}</b>. Check-in untuk <b>{result.session}</b>
              {' '}berhasil disimpan pada pukul {result.time} WIB.
            </p>
            <div className="success-detail">
              <span>Status <b>Hadir</b></span>
              <span>Penyimpanan <b>Database online</b></span>
            </div>
            <button type="button" className="secondary-button" onClick={() => setResult(null)}>
              Isi absensi peserta lain <span aria-hidden="true">↗</span>
            </button>
          </div>
        ) : (
          <>
            <div className="panel-heading">
              <p className="eyebrow">FORM KEHADIRAN</p>
              <h2 id="form-title">Siap untuk belajar?</h2>
              <p>Isi data di bawah dengan benar untuk mencatat kehadiranmu.</p>
            </div>

            <form className="attendance-form" onSubmit={handleSubmit}>
              <label>
                <span>Nama lengkap <em>*</em></span>
                <input
                  type="text"
                  name="name"
                  placeholder="Masukkan nama lengkap"
                  autoComplete="name"
                  minLength={3}
                  maxLength={100}
                  required
                />
              </label>
              <div className="field-grid">
                <label>
                  <span>Nomor peserta / ID <em>*</em></span>
                  <input
                    type="text"
                    name="participantId"
                    placeholder="Contoh: USH-024"
                    minLength={2}
                    maxLength={40}
                    required
                  />
                </label>
                <label>
                  <span>Tim / Area pelayanan <em>*</em></span>
                  <select name="team" defaultValue="" required>
                    <option value="" disabled>Pilih area</option>
                    <option>Lobby &amp; Welcome</option>
                    <option>Auditorium</option>
                    <option>Information Desk</option>
                    <option>Safety &amp; Support</option>
                  </select>
                </label>
              </div>
              <fieldset>
                <legend>Sesi training <em>*</em></legend>
                <div className="session-options">
                  <label><input type="radio" name="session" value="Basic Training" required /> Basic Training</label>
                  <label><input type="radio" name="session" value="Tools Usher" required /> Tools Usher</label>
                </div>
              </fieldset>
              <label className="consent">
                <input type="checkbox" name="consent" required />
                <span>Saya memastikan data yang diisi sudah benar.</span>
              </label>
              {error && <p className="error-message" role="alert">{error}</p>}
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Menyimpan…' : 'Catat kehadiran'}
                <span aria-hidden="true">{isSubmitting ? '·' : '→'}</span>
              </button>
              <p className="privacy-note">
                Data tersimpan aman untuk kebutuhan administrasi training.
              </p>
            </form>
          </>
        )}
      </section>
    </main>
  );
}
