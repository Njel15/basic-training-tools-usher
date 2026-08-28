'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';

type EventRecord = {
  id: string;
  title: string;
  eventDate: string;
  startTime: string;
  location: string;
  status: 'active' | 'closed';
  attendanceCount: number;
};

type PublicAttendance = {
  id: string;
  name: string;
  nij: string;
  checkedInAt: string;
};

type CheckInResult = {
  name: string;
  eventTitle: string;
  time: string;
};

function formatEventDate(value: string) {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(`${value}T12:00:00+07:00`));
}

function formatCheckInTime(value: string) {
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(value));
}

export default function Home() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [attendance, setAttendance] = useState<PublicAttendance[]>([]);
  const [now, setNow] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<CheckInResult | null>(null);

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedEventId),
    [events, selectedEventId],
  );

  const loadAttendance = useCallback(async (eventId: string) => {
    if (!eventId) return setAttendance([]);
    try {
      const response = await fetch(`/api/events/${eventId}/attendance`);
      const data = (await response.json()) as { attendance?: PublicAttendance[] };
      setAttendance(data.attendance ?? []);
    } catch {
      setAttendance([]);
    }
  }, []);

  useEffect(() => {
    fetch('/api/events')
      .then((response) => response.json())
      .then((data: { events?: EventRecord[] }) => {
        const nextEvents = data.events ?? [];
        setEvents(nextEvents);
      })
      .catch(() => setError('Daftar event belum dapat dimuat.'))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (selectedEvent?.id) {
      loadAttendance(selectedEvent.id);
    } else {
      setAttendance([]);
    }
  }, [selectedEvent?.id, loadAttendance]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedEvent) return;
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
          nij: data.get('nij'),
          eventId: selectedEvent.id,
        }),
      });
      const payload = (await response.json()) as CheckInResult & { message?: string };
      if (!response.ok) throw new Error(payload.message || 'Absensi belum berhasil disimpan.');
      setResult(payload);
      setEvents((current) =>
        current.map((item) =>
          item.id === selectedEvent.id
            ? { ...item, attendanceCount: item.attendanceCount + 1 }
            : item,
        ),
      );
      await loadAttendance(selectedEvent.id);
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

  const liveDate = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(now);
  const liveTime = new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Asia/Jakarta',
  }).format(now);

  return (
    <main className="public-page">
      <header className="public-nav">
        <a className="brand brand-dark" href="#top">
          <span className="brand-mark">UE</span>
          <span>Usher Event</span>
        </a>
        <div className="nav-actions">
          <span className="live-badge dark"><i /> Sistem aktif</span>
          <a className="admin-link" href="/admin">Admin</a>
        </div>
      </header>

      <section className="public-hero" id="top">
        <div className="hero-main">
          <p className="eyebrow lime">Our vision</p>
          <p className="vision-statement">
            Welcoming and caring the people of God to connect with the church
            and encounter His presence
          </p>
        </div>
      </section>

      <section className="purpose-section" aria-label="Mission and values">
        <article className="mission-card">
          <p className="eyebrow">Our mission</p>
          <div className="mission-layout">
            <h2>HELP</h2>
            <div className="mission-list">
              <span>Hospitality</span>
              <span>Engagement</span>
              <span>Love</span>
              <span>Pray</span>
            </div>
          </div>
        </article>

        <article className="values-card">
          <p className="eyebrow lime">Our value</p>
          <div className="value-list">
            <span>Servant</span>
            <span>Trustworthy</span>
            <span>All out</span>
            <span>Regeneration</span>
            <span>Souls</span>
          </div>
        </article>
      </section>

      <section className={selectedEvent ? 'content-grid event-selected' : 'content-grid event-choice'}>
        {!selectedEvent && <div className="event-column">
          <div className="section-heading">
            <div>
              <p className="eyebrow">EVENT AKTIF</p>
              <h2>Pilih event usher</h2>
            </div>
            <span>{events.length} event tersedia</span>
          </div>

          {isLoading ? (
            <div className="empty-state">Memuat event…</div>
          ) : events.length === 0 ? (
            <div className="empty-state">
              <b>Belum ada event aktif.</b>
              <span>Admin akan menambahkan event berikutnya di sini.</span>
            </div>
          ) : (
            <div className="event-list" role="radiogroup" aria-label="Pilih event">
              {events.map((event) => (
                <button
                  type="button"
                  role="radio"
                  aria-checked={selectedEvent?.id === event.id}
                  className={selectedEvent?.id === event.id ? 'event-card selected' : 'event-card'}
                  key={event.id}
                  onClick={() => {
                    setSelectedEventId(event.id);
                    setResult(null);
                    setError('');
                  }}
                >
                  <span className="event-date">
                    <b>{new Date(`${event.eventDate}T12:00:00+07:00`).getDate()}</b>
                    <small>{new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(new Date(`${event.eventDate}T12:00:00+07:00`))}</small>
                  </span>
                  <span className="event-info">
                    <small>CHECK-IN DIBUKA</small>
                    <strong>{event.title}</strong>
                    <em>{formatEventDate(event.eventDate)} · {event.startTime} WIB</em>
                    <em>{event.location}</em>
                  </span>
                  <span className="event-count">{event.attendanceCount}<small>hadir</small></span>
                </button>
              ))}
            </div>
          )}

        </div>}

        {selectedEvent && <aside className="checkin-panel" id="check-in">
          {result ? (
            <div className="success-card" role="status">
              <span className="success-mark">✓</span>
              <p className="eyebrow">KEHADIRAN TERCATAT</p>
              <h2>Sampai jumpa<br />di event.</h2>
              <p className="success-greeting">
                Terima kasih, <b>{result.name}</b>. Check-in untuk
                {' '}<b>{result.eventTitle}</b> tersimpan pukul {result.time} WIB.
              </p>
              <button type="button" onClick={() => setResult(null)}>
                Absensi peserta lain <span>→</span>
              </button>
              <button
                type="button"
                className="event-switch-button success-switch"
                onClick={() => {
                  setSelectedEventId('');
                  setResult(null);
                  setError('');
                }}
              >
                Pilih event lain
              </button>
            </div>
          ) : (
            <>
              <div className="panel-heading">
                <div className="panel-heading-row">
                  <p className="eyebrow">FORM KEHADIRAN</p>
                  <button
                    type="button"
                    className="event-switch-button"
                    onClick={() => {
                      setSelectedEventId('');
                      setError('');
                    }}
                  >
                    ← Ganti event
                  </button>
                </div>
                <h2>Check-in event</h2>
                <p><b>{selectedEvent.title}</b></p>
                <div className="selected-event-details">
                  <span>{formatEventDate(selectedEvent.eventDate)} · {selectedEvent.startTime} WIB</span>
                  <span>{selectedEvent.location}</span>
                </div>
              </div>
              <form className="attendance-form" onSubmit={handleSubmit}>
                <label>
                  <span>Nama lengkap <em>*</em></span>
                  <input
                    type="text"
                    name="name"
                    autoComplete="name"
                    minLength={3}
                    maxLength={100}
                    required
                    disabled={!selectedEvent}
                  />
                </label>
                <label>
                  <span>NIJ · Nomor Induk Jemaat <em>*</em></span>
                  <input
                    type="text"
                    name="nij"
                    inputMode="numeric"
                    pattern="[0-9]+"
                    minLength={2}
                    maxLength={30}
                    required
                    disabled={!selectedEvent}
                  />
                </label>
                <div className="locked-time">
                  <span>Waktu otomatis</span>
                  <b>{liveTime} WIB</b>
                  <small>{liveDate}</small>
                </div>
                {error && <p className="error-message" role="alert">{error}</p>}
                <button type="submit" disabled={!selectedEvent || isSubmitting}>
                  {isSubmitting ? 'Menyimpan…' : 'Submit Kehadiran'}
                  <span>{isSubmitting ? '·' : '→'}</span>
                </button>
                <p className="privacy-note">
                  Nama belakang dan NIJ akan disensor pada daftar publik.
                </p>
              </form>
            </>
          )}
        </aside>}

        {selectedEvent && (
          <section className="public-attendance" aria-labelledby="attendance-title">
            <div className="section-heading compact">
              <div>
                <p className="eyebrow">LIVE ATTENDANCE</p>
                <h2 id="attendance-title">Sudah hadir</h2>
              </div>
              <span>Data publik disensor</span>
            </div>
            {attendance.length ? (
              <div className="attendee-list">
                {attendance.map((person, index) => (
                  <div className="attendee-row" key={person.id}>
                    <span className="row-number">{String(index + 1).padStart(2, '0')}</span>
                    <span><b>{person.name}</b><small>NIJ {person.nij}</small></span>
                    <time>{formatCheckInTime(person.checkedInAt)} WIB</time>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state small">Belum ada peserta yang check-in.</div>
            )}
          </section>
        )}
      </section>
    </main>
  );
}
