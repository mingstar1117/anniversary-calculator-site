'use client';

import { useMemo, useState } from 'react';

const DAY_STEPS = Array.from({ length: 10 }, (_, index) => (index + 1) * 100);
const WEEKDAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

function formatIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function createLocalDate(isoDateText) {
  const [year, month, day] = isoDateText.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const weekday = WEEKDAY_NAMES[date.getDay()];
  return `${year}.${month}.${day} (${weekday})`;
}

const HEARTS = [
  { left: '6%', delay: '0s', duration: '13s', size: '14px' },
  { left: '14%', delay: '1.2s', duration: '12s', size: '20px' },
  { left: '24%', delay: '2.3s', duration: '15s', size: '16px' },
  { left: '32%', delay: '0.8s', duration: '11s', size: '12px' },
  { left: '42%', delay: '3s', duration: '14s', size: '18px' },
  { left: '50%', delay: '1.8s', duration: '10s', size: '13px' },
  { left: '58%', delay: '2.8s', duration: '16s', size: '22px' },
  { left: '66%', delay: '0.6s', duration: '12s', size: '15px' },
  { left: '74%', delay: '4s', duration: '14s', size: '17px' },
  { left: '82%', delay: '1.5s', duration: '11s', size: '13px' },
  { left: '90%', delay: '2.1s', duration: '15s', size: '19px' },
  { left: '96%', delay: '3.2s', duration: '13s', size: '14px' },
];

export default function HomePage() {
  const [startDate, setStartDate] = useState(() => formatIsoDate(new Date()));

  const results = useMemo(() => {
    if (!startDate) return [];
    const base = createLocalDate(startDate);

    return DAY_STEPS.map((days) => {
      const targetDate = addDays(base, days);
      return {
        days,
        label: formatDate(targetDate),
        iso: formatIsoDate(targetDate),
      };
    });
  }, [startDate]);

  return (
    <>
      <div className="hearts" aria-hidden="true">
        {HEARTS.map((heart, index) => (
          <span
            key={`${heart.left}-${index}`}
            style={{
              '--left': heart.left,
              '--delay': heart.delay,
              '--duration': heart.duration,
              '--size': heart.size,
            }}
          />
        ))}
      </div>

      <main className="app" aria-labelledby="title">
        <header className="hero">
          <p className="eyebrow">Anniversary Calculator</p>
          <h1 id="title">기념일 계산기</h1>
          <p className="subtitle">날짜를 입력하면 100일부터 1000일까지 100일 단위 기념일을 계산해드려요.</p>
        </header>

        <section className="panel" aria-label="날짜 입력">
          <form className="form" onSubmit={(event) => event.preventDefault()}>
            <label htmlFor="start-date">기준 날짜</label>
            <div className="form-row">
              <input
                id="start-date"
                name="start-date"
                type="date"
                required
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
              />
              <button type="submit">계산하기</button>
            </div>
            <p className="hint">예: 2026-03-04</p>
          </form>
        </section>

        <section className="panel" aria-live="polite" aria-label="계산 결과">
          <h2>결과</h2>
          <div className="result-grid">
            {results.map((item) => (
              <article className="card" key={item.days}>
                <strong>{item.days}일</strong>
                <time dateTime={item.iso}>{item.label}</time>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
