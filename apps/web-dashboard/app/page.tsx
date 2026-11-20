"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import TechBackground from "../components/TechBackground";

const copy = {
  en: {
    privateLabel: "PRIVATE INSTANCE",
    publicLabel: "PUBLIC WORKFLOW",
    privateTitle: "Friday Operations",
    privateDescription: "GPS tracking, routes, supervisors, geofencing and verified visits",
    publicTitle: "Workflow & B2B",
    publicDescription: "Tasks, approvals, exception reviews and store requests",
    enter: "Enter portal",
    title: "Field Operations Command",
    live: "LIVE",
    supervisors: "Active Supervisors",
    routes: "Active Routes",
    visits: "Verified Visits",
    exceptions: "Exceptions",
    gateway: "Integration Gateway",
    sync: "Bi-directional sync",
  },
  ar: {
    privateLabel: "النسخة الخاصة",
    publicLabel: "بوابة سير العمل",
    privateTitle: "عمليات Friday",
    privateDescription: "تتبع GPS والمسارات والمشرفين والسياج الجغرافي والزيارات",
    publicTitle: "سير العمل وB2B",
    publicDescription: "المهام والموافقات ومراجعة الاستثناءات وطلبات المتاجر",
    enter: "دخول البوابة",
    title: "مركز قيادة العمليات الميدانية",
    live: "مباشر",
    supervisors: "المشرفون النشطون",
    routes: "المسارات النشطة",
    visits: "الزيارات الموثقة",
    exceptions: "الاستثناءات",
    gateway: "البوابة الرابطة",
    sync: "مزامنة ثنائية الاتجاه",
  },
};

export default function Home() {
  const [locale, setLocale] = useState<"en" | "ar">("en");
  const [instance, setInstance] = useState<"PRIVATE_FRIDAY" | "PUBLIC_WORKFLOW">("PRIVATE_FRIDAY");
  const t = copy[locale];

  return (
    <main className="shell" dir={locale === "ar" ? "rtl" : "ltr"}>
      <TechBackground />
      <header className="topbar glass">
        <div className="brand">
          <span className="brand-mark">F</span>
          <div>
            <strong>Friday</strong>
            <small>Field Operations Ecosystem</small>
          </div>
        </div>
        <nav aria-label="Instance selector">
          <button
            className={`nav-button ${instance === "PRIVATE_FRIDAY" ? "active" : ""}`}
            onClick={() => setInstance("PRIVATE_FRIDAY")}
          >
            {t.privateLabel}
          </button>
          <button
            className={`nav-button ${instance === "PUBLIC_WORKFLOW" ? "active" : ""}`}
            onClick={() => setInstance("PUBLIC_WORKFLOW")}
          >
            {t.publicLabel}
          </button>
        </nav>
        <button
          className="locale-button"
          onClick={() => setLocale(locale === "en" ? "ar" : "en")}
        >
          {locale === "en" ? "العربية" : "English"}
        </button>
      </header>

      <section className="content">
        <div className="heading-row">
          <div>
            <div className="eyebrow"><i /> {t.live}</div>
            <h1>{t.title}</h1>
          </div>
          <div className="gateway glass">
            <span className="gateway-dot" />
            <div>
              <strong>{t.gateway}</strong>
              <small>{t.sync}</small>
            </div>
          </div>
        </div>

        <div className="portal-grid">
          <motion.button
            type="button"
            className={`portal-card glass ${instance === "PRIVATE_FRIDAY" ? "selected" : ""}`}
            onClick={() => setInstance("PRIVATE_FRIDAY")}
            whileHover={{ y: -3 }}
          >
            <span className="portal-icon cyan">GPS</span>
            <div>
              <small>{t.privateLabel}</small>
              <strong>{t.privateTitle}</strong>
              <p>{t.privateDescription}</p>
            </div>
            <span className="enter">{t.enter} <b>→</b></span>
          </motion.button>
          <motion.button
            type="button"
            className={`portal-card glass ${instance === "PUBLIC_WORKFLOW" ? "selected" : ""}`}
            onClick={() => setInstance("PUBLIC_WORKFLOW")}
            whileHover={{ y: -3 }}
          >
            <span className="portal-icon emerald">B2B</span>
            <div>
              <small>{t.publicLabel}</small>
              <strong>{t.publicTitle}</strong>
              <p>{t.publicDescription}</p>
            </div>
            <span className="enter">{t.enter} <b>→</b></span>
          </motion.button>
        </div>

        <div className="metrics">
          {[
            [t.supervisors, "24", "+3"],
            [t.routes, "12", "98%"],
            [t.visits, "148", "+18"],
            [t.exceptions, "6", "-2"],
          ].map(([label, value, delta], index) => (
            <motion.article
              className="metric glass"
              key={label}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              <span>{label}</span>
              <strong>{value}</strong>
              <small>{delta}</small>
            </motion.article>
          ))}
        </div>

        <section className="map-card glass" aria-label="Live operations map">
          <div className="map-grid" />
          <div className="radar radar-one"><span /></div>
          <div className="radar radar-two amber"><span /></div>
          <div className="radar radar-three"><span /></div>
          <div className="route route-one" />
          <div className="route route-two" />
          <div className="map-status glass">
            <span className="status-dot" />
            <div><strong>GPS TELEMETRY</strong><small>30 seconds ago</small></div>
          </div>
        </section>
      </section>
    </main>
  );
}
