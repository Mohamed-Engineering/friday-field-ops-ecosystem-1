"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import TechBackground from "../components/TechBackground";

const copy = {
  en: {
    brand: "Friday",
    subtitle: "Projects & field services",
    eyebrow: "PUBLIC INSTANCE",
    title: "Bring your next project to life.",
    intro:
      "Explore our field operations projects and request a visit at a location that works for you.",
    gallery: "Projects & applications",
    galleryIntro: "A few ways we help teams work better in the field.",
    projects: [
      {
        id: "retail-operations",
        title: "Retail operations",
        description:
          "Coordinate store visits, service schedules, and on-site workflows.",
        tag: "FIELD OPERATIONS",
      },
      {
        id: "distribution-network",
        title: "Distribution networks",
        description:
          "Connect locations and teams with clear, reliable field processes.",
        tag: "CONNECTED TEAMS",
      },
      {
        id: "customer-services",
        title: "Customer services",
        description:
          "Plan a site visit around your needs and the location you choose.",
        tag: "ON-SITE SERVICE",
      },
    ],
    requestTitle: "Request a visit",
    requestIntro:
      "Share your contact details and choose your location so our team can follow up.",
    name: "Your name",
    namePlaceholder: "Full name",
    phone: "Phone number",
    phonePlaceholder: "+1 555 000 0000",
    project: "Project or service",
    chooseProject: "Choose a project",
    message: "Anything we should know? (optional)",
    messagePlaceholder: "Tell us briefly what you need",
    location: "Your location",
    locationHelp:
      "Use your device location or enter coordinates manually. Your location is shared only with the private operations team to arrange this visit.",
    locate: "Use my current location",
    locating: "Getting location…",
    latitude: "Latitude",
    longitude: "Longitude",
    submit: "Send visit request",
    submitting: "Sending…",
    success:
      "Your visit request was delivered to our operations team. We will be in touch.",
    locateError:
      "We could not get your location. Allow location access or enter coordinates manually.",
    submitError:
      "Your request could not be delivered. Please try again in a moment.",
    required: "Please complete all required fields and provide a valid location.",
    footer: "Friday Field Operations",
  },
  ar: {
    brand: "Friday",
    subtitle: "المشاريع والخدمات الميدانية",
    eyebrow: "النسخة العامة",
    title: "لنحوّل مشروعك القادم إلى واقع.",
    intro:
      "استكشف مشاريعنا الميدانية واطلب زيارة في الموقع المناسب لك.",
    gallery: "المشاريع والتطبيقات",
    galleryIntro: "بعض الطرق التي نساعد بها الفرق على تحسين العمل الميداني.",
    projects: [
      {
        id: "retail-operations",
        title: "عمليات البيع بالتجزئة",
        description: "تنسيق زيارات المتاجر والخدمات وسير العمل في الموقع.",
        tag: "العمليات الميدانية",
      },
      {
        id: "distribution-network",
        title: "شبكات التوزيع",
        description: "ربط المواقع والفرق بإجراءات ميدانية واضحة وموثوقة.",
        tag: "فرق مترابطة",
      },
      {
        id: "customer-services",
        title: "خدمات العملاء",
        description: "خطط لزيارة ميدانية وفق احتياجاتك والموقع الذي تختاره.",
        tag: "خدمة ميدانية",
      },
    ],
    requestTitle: "اطلب زيارة",
    requestIntro: "أدخل بيانات التواصل وحدد موقعك ليتابع فريقنا طلبك.",
    name: "الاسم",
    namePlaceholder: "الاسم الكامل",
    phone: "رقم الهاتف",
    phonePlaceholder: "+966 5X XXX XXXX",
    project: "المشروع أو الخدمة",
    chooseProject: "اختر مشروعاً",
    message: "معلومات إضافية (اختياري)",
    messagePlaceholder: "أخبرنا باختصار بما تحتاج إليه",
    location: "موقعك",
    locationHelp:
      "استخدم موقع جهازك أو أدخل الإحداثيات يدوياً. سيُشارك الموقع مع فريق العمليات الخاص لترتيب هذه الزيارة فقط.",
    locate: "استخدم موقعي الحالي",
    locating: "جارٍ تحديد الموقع…",
    latitude: "خط العرض",
    longitude: "خط الطول",
    submit: "إرسال طلب الزيارة",
    submitting: "جارٍ الإرسال…",
    success: "تم تسليم طلبك إلى فريق العمليات. سنتواصل معك قريباً.",
    locateError:
      "تعذر تحديد موقعك. اسمح بالوصول إلى الموقع أو أدخل الإحداثيات يدوياً.",
    submitError: "تعذر تسليم الطلب. يرجى المحاولة مرة أخرى بعد قليل.",
    required: "يرجى إكمال الحقول المطلوبة وإدخال موقع صحيح.",
    footer: "Friday للعمليات الميدانية",
  },
};

export default function Home() {
  const [locale, setLocale] = useState<"en" | "ar">("en");
  const [selectedProject, setSelectedProject] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const t = copy[locale];

  function chooseProject(projectId: string) {
    setSelectedProject(projectId);
    document.getElementById("request")?.scrollIntoView({ behavior: "smooth" });
  }

  function getCurrentLocation() {
    if (!navigator.geolocation) {
      setError(t.locateError);
      return;
    }

    setIsLocating(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLatitude(coords.latitude.toFixed(6));
        setLongitude(coords.longitude.toFixed(6));
        setIsLocating(false);
      },
      () => {
        setError(t.locateError);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  async function submitVisitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setError("");
    setSubmitted(false);
    const formData = new FormData(form);
    const lat = Number(latitude);
    const lon = Number(longitude);
    if (
      !selectedProject ||
      !latitude.trim() ||
      !longitude.trim() ||
      !formData.get("name")?.toString().trim() ||
      !formData.get("phone")?.toString().trim() ||
      !Number.isFinite(lat) ||
      lat < -90 ||
      lat > 90 ||
      !Number.isFinite(lon) ||
      lon < -180 ||
      lon > 180
    ) {
      setError(t.required);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/public/visit-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: formData.get("name")?.toString(),
          phone: formData.get("phone")?.toString(),
          projectId: selectedProject,
          message: formData.get("message")?.toString() ?? "",
          location: { latitude: lat, longitude: lon },
        }),
      });

      if (!response.ok) {
        throw new Error("Visit request delivery failed");
      }

      form.reset();
      setSelectedProject("");
      setLatitude("");
      setLongitude("");
      setSubmitted(true);
    } catch {
      setError(t.submitError);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="shell" dir={locale === "ar" ? "rtl" : "ltr"}>
      <TechBackground />
      <header className="topbar glass">
        <a className="brand" href="#home" aria-label="Friday home">
          <span className="brand-mark">F</span>
          <span>
            <strong>{t.brand}</strong>
            <small>{t.subtitle}</small>
          </span>
        </a>
        <span className="instance-label">
          <i />
          {t.eyebrow}
        </span>
        <button
          className="locale-button"
          type="button"
          onClick={() => setLocale(locale === "en" ? "ar" : "en")}
        >
          {locale === "en" ? "العربية" : "English"}
        </button>
      </header>

      <section className="hero content" id="home">
        <div className="hero-copy">
          <div className="eyebrow">{t.eyebrow}</div>
          <h1>{t.title}</h1>
          <p>{t.intro}</p>
          <a className="primary-link" href="#projects">
            {t.gallery} <span aria-hidden="true">↓</span>
          </a>
        </div>
        <div className="hero-art glass" aria-hidden="true">
          <div className="hero-orbit orbit-one" />
          <div className="hero-orbit orbit-two" />
          <div className="hero-pin"><span /></div>
          <div className="hero-glow" />
          <div className="hero-caption">PUBLIC · PROJECTS · VISITS</div>
        </div>
      </section>

      <section className="content section" id="projects">
        <div className="section-heading">
          <div>
            <span className="eyebrow">{t.eyebrow}</span>
            <h2>{t.gallery}</h2>
          </div>
          <p>{t.galleryIntro}</p>
        </div>
        <div className="project-grid">
          {t.projects.map((project, index) => (
            <motion.article
              className={`project-card glass project-${index + 1}`}
              key={project.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              <div className="project-art" aria-hidden="true">
                <span className="project-art-mark">{`0${index + 1}`}</span>
                <i />
                <i />
                <i />
              </div>
              <div className="project-info">
                <span className="project-tag">{project.tag}</span>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <button
                  type="button"
                  className="text-button"
                  onClick={() => chooseProject(project.id)}
                >
                  {t.requestTitle} <span aria-hidden="true">↗</span>
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="content request-section" id="request">
        <div className="request-aside">
          <span className="eyebrow">{t.eyebrow}</span>
          <h2>{t.requestTitle}</h2>
          <p>{t.requestIntro}</p>
          <div className="privacy-note glass">
            <span className="privacy-mark" aria-hidden="true">⌖</span>
            <p>{t.locationHelp}</p>
          </div>
        </div>
        <form className="request-form glass" onSubmit={submitVisitRequest}>
          <label>
            {t.name}
            <input name="name" autoComplete="name" required maxLength={120} placeholder={t.namePlaceholder} />
          </label>
          <label>
            {t.phone}
            <input name="phone" type="tel" autoComplete="tel" required maxLength={40} placeholder={t.phonePlaceholder} />
          </label>
          <label>
            {t.project}
            <select
              value={selectedProject}
              onChange={(event) => setSelectedProject(event.target.value)}
              required
            >
              <option value="">{t.chooseProject}</option>
              {t.projects.map((project) => (
                <option key={project.id} value={project.id}>{project.title}</option>
              ))}
            </select>
          </label>
          <label>
            {t.message}
            <textarea name="message" rows={3} maxLength={1000} placeholder={t.messagePlaceholder} />
          </label>
          <fieldset>
            <legend>{t.location}</legend>
            <button
              className="location-button"
              type="button"
              onClick={getCurrentLocation}
              disabled={isLocating}
            >
              <span aria-hidden="true">⌖</span>
              {isLocating ? t.locating : t.locate}
            </button>
            <div className="coordinate-grid">
              <label>
                {t.latitude}
                <input
                  type="number"
                  inputMode="decimal"
                  min="-90"
                  max="90"
                  step="any"
                  required
                  value={latitude}
                  onChange={(event) => setLatitude(event.target.value)}
                />
              </label>
              <label>
                {t.longitude}
                <input
                  type="number"
                  inputMode="decimal"
                  min="-180"
                  max="180"
                  step="any"
                  required
                  value={longitude}
                  onChange={(event) => setLongitude(event.target.value)}
                />
              </label>
            </div>
          </fieldset>
          {error && <p className="form-message error" role="alert">{error}</p>}
          {submitted && <p className="form-message success" role="status">{t.success}</p>}
          <button className="submit-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? t.submitting : t.submit}
            <span aria-hidden="true">→</span>
          </button>
        </form>
      </section>

      <footer className="footer content">
        <span>{t.footer}</span>
        <span>{t.eyebrow}</span>
      </footer>
    </main>
  );
}
