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

type AttendanceRecord = {
  id: string;
  name: string;
  nij: string;
  checkedInAt: string;
};

function dateLabel(value: string) {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(`${value}T12:00:00+07:00`));
}

export default function AdminDashboard({
  adminName,
  signOutPath,
}: {
  adminName: string;
  signOutPath: string;
}) {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedId) ?? events[0],
    [events, selectedId],
  );

  const loadEvents = useCallback(async () => {
    const response = await fetch('/api/admin/events');
    if (!response.ok) return;
    const data = (await response.json()) as { events: EventRecord[] };
    setEvents(data.events);
    setSelectedId((current) => current || data.events[0]?.id || '');
  }, []);

  const loadAttendance = useCallback(async (eventId: string) => {
    if (!eventId) return setAttendance([]);
    const response = await fetch(`/api/admin/events/${eventId}/attendance`);
    if (!response.ok) return setAttendance([]);
    const data = (await response.json()) as { attendance: AttendanceRecord[] };
    setAttendance(data.attendance);
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    if (selectedEvent?.id) loadAttendance(selectedEvent.id);
  }, [selectedEvent?.id, loadAttendance]);

  async function createNewEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage('');
    const form = event.currentTarget;
    const data = new FormData(form);
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: data.get('title'),
        eventDate: data.get('eventDate'),
        startTime: data.get('startTime'),
        location: data.get('location'),
      }),
    });
    const payload = (await response.json()) as { message?: string; event?: { id: string } };
    setMessage(payload.message ?? '');
    if (response.ok) {
      form.reset();
      await loadEvents();
      if (payload.event?.id) setSelectedId(payload.event.id);
    }
    setIsSaving(false);
  }

  async function changeStatus(id: string, status: 'active' | 'closed') {
    const response = await fetch(`/api/events/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const payload = (await response.json()) as { message?: string };
    setMessage(payload.message ?? '');
    if (response.ok) await loadEvents();
  }

  async function removeAttendance(record: AttendanceRecord) {
    if (!window.confirm(`Hapus absensi ${record.name}? Tindakan ini tidak dapat dibatalkan.`)) return;
    const response = await fetch(`/api/admin/attendance/${record.id}`, {
      method: 'DELETE',
    });
    const payload = (await response.json()) as { message?: string };
    setMessage(payload.message ?? '');
    if (response.ok && selectedEvent) {
      await Promise.all([loadAttendance(selectedEvent.id), loadEvents()]);
    }
  }

  return (
    <main className="admin-page">
      <aside className="admin-sidebar">
        <a className="brand" href="/">
          <span className="brand-mark">UE</span>
          <span>Usher Event</span>
        </a>
        <nav>
          <a className="active" href="#events">Event &amp; arsip</a>
          <a href="#create-event">Buat event</a>
          <a href="#attendance-admin">Data absensi</a>
        </nav>
        <div className="admin-user">
          <small>ADMIN</small>
          <b>{adminName}</b>
          <a href={signOutPath}>Keluar</a>
        </div>
      </aside>

      <section className="admin-main">
        <header className="admin-header">
          <div>
            <p className="eyebrow">ADMIN CONSOLE</p>
            <h1>Kelola event usher</h1>
          </div>
          <a href="/" target="_blank">Lihat halaman publik ↗</a>
        </header>

        {message && <p className="admin-message" role="status">{message}</p>}

        <section id="create-event" className="admin-card create-event-card">
          <div className="card-title">
            <span>01</span>
            <div><h2>Buat event baru</h2><p>Event aktif langsung muncul di halaman publik.</p></div>
          </div>
          <form className="event-form" onSubmit={createNewEvent}>
            <label className="wide">
              <span>Nama event</span>
              <input name="title" placeholder="Contoh: Refreshment Usher 2027" required minLength={3} maxLength={120} />
            </label>
            <label>
              <span>Tanggal</span>
              <input name="eventDate" type="date" required />
            </label>
            <label>
              <span>Jam mulai</span>
              <input name="startTime" type="time" required />
            </label>
            <label className="wide">
              <span>Lokasi</span>
              <input name="location" placeholder="Contoh: Main Hall" maxLength={100} />
            </label>
            <button type="submit" disabled={isSaving}>
              {isSaving ? 'Menyimpan…' : 'Buat event'} <span>＋</span>
            </button>
          </form>
        </section>

        <section id="events" className="admin-card">
          <div className="card-title">
            <span>02</span>
            <div><h2>Event &amp; arsip tahunan</h2><p>Event selesai tetap tersimpan sebagai database admin.</p></div>
          </div>
          <div className="admin-event-list">
            {events.map((event) => (
              <button
                type="button"
                className={selectedEvent?.id === event.id ? 'admin-event selected' : 'admin-event'}
                key={event.id}
                onClick={() => setSelectedId(event.id)}
              >
                <span><b>{dateLabel(event.eventDate)}</b><small>{event.startTime} · {event.location}</small></span>
                <span><strong>{event.title}</strong><small>{event.attendanceCount} peserta</small></span>
                <em className={event.status}>{event.status === 'active' ? 'Aktif' : 'Selesai'}</em>
              </button>
            ))}
          </div>
          {selectedEvent && (
            <div className="event-actions">
              <p><b>{selectedEvent.title}</b><span>Ubah status event tanpa menghapus arsipnya.</span></p>
              {selectedEvent.status === 'active' ? (
                <button type="button" className="close-action" onClick={() => changeStatus(selectedEvent.id, 'closed')}>
                  Tutup event
                </button>
              ) : (
                <button type="button" className="open-action" onClick={() => changeStatus(selectedEvent.id, 'active')}>
                  Aktifkan kembali
                </button>
              )}
            </div>
          )}
        </section>

        <section id="attendance-admin" className="admin-card">
          <div className="card-title">
            <span>03</span>
            <div>
              <h2>Database absensi</h2>
              <p>{selectedEvent?.title ?? 'Pilih event untuk melihat data.'}</p>
            </div>
          </div>
          <div className="admin-table-wrap">
            <table>
              <thead><tr><th>Nama lengkap</th><th>NIJ</th><th>Waktu check-in</th><th /></tr></thead>
              <tbody>
                {attendance.map((record) => (
                  <tr key={record.id}>
                    <td>{record.name}</td>
                    <td>{record.nij}</td>
                    <td>{new Intl.DateTimeFormat('id-ID', {
                      dateStyle: 'medium',
                      timeStyle: 'medium',
                      timeZone: 'Asia/Jakarta',
                    }).format(new Date(record.checkedInAt))} WIB</td>
                    <td>
                      <button type="button" className="delete-button" onClick={() => removeAttendance(record)}>
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
                {!attendance.length && (
                  <tr><td colSpan={4} className="empty-cell">Belum ada data absensi untuk event ini.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}
