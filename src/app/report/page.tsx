"use client";

import Link from "next/link";
import { FormEvent, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ImagePlus,
  LocateFixed,
  LoaderCircle,
  MapPin,
  Send,
  Sparkles
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import type {
  BarrierCategory,
  ReportSeverity,
} from "@/types/report";

type FormData = {
  title: string;
  locationName: string;
  address: string;
  category: BarrierCategory;
  description: string;
  severity: ReportSeverity;
  latitude: number | null;
  longitude: number | null;
};

const initialForm: FormData = {
  title: "",
  locationName: "",
  address: "",
  category: "entrance",
  description: "",
  severity: "medium",
  latitude: null,
  longitude: null,
};

export default function ReportPage() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  

  function updateField<K extends keyof FormData>(
    field: K,
    value: FormData[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setError("Location services are not supported by this browser.");
      return;
    }

    setError(null);
    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((current) => ({
          ...current,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));

        setLocating(false);
      },
      (locationError) => {
        console.error("Location error:", locationError);

        setError(
          "We couldn't access your location. You can still submit the report without it.",
        );

        setLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  }
  function structureLocally() {
  const text = aiInput.trim();

  let category: BarrierCategory = "other";
  let severity: ReportSeverity = "medium";

  const lower = text.toLowerCase();

  if (lower.includes("elevator") || lower.includes("lift")) {
    category = "elevator";
  } else if (lower.includes("ramp")) {
    category = "ramp";
  } else if (
    lower.includes("sidewalk") ||
    lower.includes("path") ||
    lower.includes("walkway")
  ) {
    category = "sidewalk";
  } else if (
    lower.includes("restroom") ||
    lower.includes("bathroom") ||
    lower.includes("toilet")
  ) {
    category = "restroom";
  } else if (
    lower.includes("door") ||
    lower.includes("entrance") ||
    lower.includes("stairs")
  ) {
    category = "entrance";
  } else if (lower.includes("construction")) {
    category = "construction";
  }

  if (
    lower.includes("cannot") ||
    lower.includes("can't") ||
    lower.includes("blocked") ||
    lower.includes("no access") ||
    lower.includes("prevent")
  ) {
    severity = "high";
  } else if (
    lower.includes("difficult") ||
    lower.includes("hard to") ||
    lower.includes("broken")
  ) {
    severity = "medium";
  }

  const title =
    text.length > 80
      ? `${text.slice(0, 77)}...`
      : text;

  setForm((current) => ({
    ...current,
    title,
    category,
    severity,
    description: text,
  }));

  setError(
    "AI assistance is currently unavailable, so AccessMap used basic automatic categorization instead. Please review the suggested fields before submitting.",
  );
}
  async function structureWithAI() {
  if (aiInput.trim().length < 15) {
    setError(
      "Describe the barrier in a little more detail before using AI assistance.",
    );
    return;
  }

  setError(null);
  setAiLoading(true);

  try {
    const response = await fetch("/api/assist-report", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rawReport: aiInput,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
  if (result.fallback) {
    structureLocally();
    return;
  }

  throw new Error(
    result.error || "AI assistance failed.",
  );
}

    setForm((current) => ({
      ...current,
      title: result.title,
      category: result.category,
      severity: result.severity,
      description: result.description,
    }));
  } catch (error) {
    console.error(error);

    setError(
      "AI assistance is unavailable right now. You can still complete the report manually.",
    );
  } finally {
    setAiLoading(false);
  }
}
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);

    if (
      !form.title.trim() ||
      !form.locationName.trim() ||
      !form.address.trim() ||
      !form.description.trim()
    ) {
      setError("Please complete all required fields.");
      return;
    }

    if (form.description.trim().length < 20) {
      setError(
        "Please add a little more detail so the organization can understand the barrier.",
      );
      return;
    }

    setSubmitting(true);

    let imageUrl: string | null = null;

if (photo) {
  if (!photo.type.startsWith("image/")) {
    setError("Please choose an image file.");
    setSubmitting(false);
    return;
  }

  if (photo.size > 5 * 1024 * 1024) {
    setError("Photo must be smaller than 5 MB.");
    setSubmitting(false);
    return;
  }

  const extension = photo.name.split(".").pop()?.toLowerCase() || "jpg";

  const filePath = `reports/${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("report-images")
    .upload(filePath, photo, {
      contentType: photo.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("Photo upload failed:", uploadError);

    setError(
      "We couldn't upload the photo. Please try again or submit without it.",
    );

    setSubmitting(false);
    return;
  }

  const { data: publicUrlData } = supabase.storage
    .from("report-images")
    .getPublicUrl(filePath);

  imageUrl = publicUrlData.publicUrl;
}

    const { error: insertError } = await supabase
      .from("reports")
      .insert({
        title: form.title.trim(),
        location_name: form.locationName.trim(),
        address: form.address.trim(),
        category: form.category,
        description: form.description.trim(),
        severity: form.severity,
        latitude: form.latitude,
        longitude: form.longitude,
        image_url: imageUrl,
      });

    if (insertError) {
      console.error("Report submission failed:", insertError);

      setError(
        "We couldn't submit your report. Please try again in a moment.",
      );

      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-xl">
          <div className="rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-sm sm:p-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircle2 size={28} />
            </div>

            <p className="mt-6 text-sm font-bold uppercase tracking-wider text-emerald-700">
              Report submitted
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
              Thank you for making this barrier visible.
            </h1>

            <p className="mt-4 leading-7 text-slate-600">
              Your report has been sent for review. It starts as Submitted and
              can be updated as the organization verifies and addresses the
              issue.
            </p>

            {form.latitude !== null && form.longitude !== null && (
              <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-left">
                <div className="flex items-start gap-3">
                  <MapPin
                    size={18}
                    className="mt-0.5 shrink-0 text-blue-700"
                  />

                  <div>
                    <p className="text-sm font-bold text-blue-950">
                      Map location attached
                    </p>

                    <p className="mt-1 text-sm leading-6 text-blue-800">
                      This report can now appear on the AccessMap interactive
                      map.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/"
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                Explore reports
              </Link>

              <button
                type="button"
                onClick={() => {
                  setForm(initialForm);
                  setError(null);
                  setSubmitted(false);
                }}
                className="min-h-12 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-100"
              >
                Submit another
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg text-sm font-bold text-slate-600 transition hover:text-slate-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          <ArrowLeft size={16} />
          Back to AccessMap
        </Link>

        <div className="mt-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
            <MapPin size={23} />
          </div>

          <p className="mt-6 text-sm font-bold uppercase tracking-wider text-blue-700">
            Community report
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">
            Report an accessibility barrier
          </h1>

          <p className="mt-4 max-w-2xl leading-7 text-slate-600">
            Tell us what is making this place difficult to access. Clear,
            specific reports make it easier for organizations to understand and
            address barriers.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >
          {error && (
            <div
              role="alert"
              className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800"
            >
              {error}
            </div>
          )}

          <div className="mb-8 rounded-2xl border border-violet-200 bg-violet-50 p-5 sm:p-6">
  <div className="flex items-start gap-3">
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-violet-700">
      <Sparkles size={20} />
    </span>

    <div className="flex-1">
      <p className="font-bold text-violet-950">
        Describe it naturally
      </p>

      <p className="mt-1 text-sm leading-6 text-violet-800">
        AI can organize your description into a clear report. You can review
        and edit everything before submitting.
      </p>
    </div>
  </div>

  <textarea
    value={aiInput}
    onChange={(event) => setAiInput(event.target.value)}
    rows={3}
    maxLength={1200}
    placeholder="e.g. The elevator has been broken for three days and wheelchair users cannot reach the second floor."
    className="mt-4 w-full resize-y rounded-xl border border-violet-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
  />

  <button
    type="button"
    onClick={structureWithAI}
    disabled={aiLoading}
    className="mt-3 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-violet-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-60"
  >
    {aiLoading ? (
      <>
        <LoaderCircle
          size={17}
          className="animate-spin"
        />
        Structuring report...
      </>
    ) : (
      <>
        <Sparkles size={17} />
        Structure with AI
      </>
    )}
  </button>
</div>

          <div className="grid gap-6">
            <Field>
              <Label htmlFor="title">What is the barrier?</Label>

              <input
                id="title"
                type="text"
                required
                maxLength={120}
                value={form.title}
                onChange={(event) =>
                  updateField("title", event.target.value)
                }
                placeholder="e.g. Elevator is out of service"
                className={inputStyles}
              />

              <HelpText>
                Use a short title that makes the issue immediately clear.
              </HelpText>
            </Field>

            <div className="grid gap-6 sm:grid-cols-2">
              <Field>
                <Label htmlFor="locationName">Location name</Label>

                <input
                  id="locationName"
                  type="text"
                  required
                  maxLength={100}
                  value={form.locationName}
                  onChange={(event) =>
                    updateField("locationName", event.target.value)
                  }
                  placeholder="e.g. Central Library"
                  className={inputStyles}
                />
              </Field>

              <Field>
                <Label htmlFor="address">Address or area</Label>

                <input
                  id="address"
                  type="text"
                  required
                  maxLength={160}
                  value={form.address}
                  onChange={(event) =>
                    updateField("address", event.target.value)
                  }
                  placeholder="e.g. Main entrance"
                  className={inputStyles}
                />
              </Field>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <Field>
                <Label htmlFor="category">Barrier type</Label>

                <select
                  id="category"
                  value={form.category}
                  onChange={(event) =>
                    updateField(
                      "category",
                      event.target.value as BarrierCategory,
                    )
                  }
                  className={inputStyles}
                >
                  <option value="ramp">Missing or blocked ramp</option>
                  <option value="elevator">Elevator / lift</option>
                  <option value="sidewalk">Sidewalk / pathway</option>
                  <option value="restroom">Accessible restroom</option>
                  <option value="entrance">Entrance / doorway</option>
                  <option value="construction">Construction barrier</option>
                  <option value="other">Other</option>
                </select>
              </Field>

              <Field>
                <Label htmlFor="severity">Impact</Label>

                <select
                  id="severity"
                  value={form.severity}
                  onChange={(event) =>
                    updateField(
                      "severity",
                      event.target.value as ReportSeverity,
                    )
                  }
                  className={inputStyles}
                >
                  <option value="low">Low — inconvenient</option>

                  <option value="medium">
                    Medium — significantly difficult
                  </option>

                  <option value="high">
                    High — prevents access
                  </option>
                </select>
              </Field>
            </div>

            <Field>
              <Label htmlFor="description">
                Describe what is happening
              </Label>

              <textarea
                id="description"
                required
                rows={6}
                maxLength={800}
                value={form.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                placeholder="Describe the barrier, who it may affect, and any useful details about the location..."
                className={`${inputStyles} resize-y`}
              />

              <div className="flex justify-between gap-4">
                <HelpText>
                  Please include enough detail for someone unfamiliar with the
                  location.
                </HelpText>

                <span className="shrink-0 text-xs font-medium text-slate-400">
                  {form.description.length}/800
                </span>
              </div>
            </Field>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
  <div className="flex items-start gap-3">
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700">
      <ImagePlus size={20} />
    </span>

    <div className="flex-1">
      <label
        htmlFor="photo"
        className="font-bold text-slate-950"
      >
        Add photo evidence
      </label>

      <p className="mt-1 text-sm leading-6 text-slate-600">
        Optional. Upload a JPG or PNG image up to 5 MB.
      </p>

      <input
        ref={photoInputRef}
        id="photo"
        type="file"
        accept="image/jpeg,image/png"
        onChange={(event) => {
          const file = event.target.files?.[0] ?? null;

          if (!file) {
            setPhoto(null);
            return;
          }

          const allowedTypes = [
            "image/jpeg",
            "image/png",
          ];

          if (!allowedTypes.includes(file.type)) {
            setError("Please choose a JPG or PNG image.");
            event.target.value = "";
            setPhoto(null);
            return;
          }

          if (file.size > 5 * 1024 * 1024) {
            setError("Photo must be 5 MB or smaller.");
            event.target.value = "";
            setPhoto(null);
            return;
          }

          setError(null);
          setPhoto(file);
        }}
        className="sr-only"
      />

      {!photo ? (
        <label
          htmlFor="photo"
          className="mt-4 inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
        >
          Choose photo
        </label>
      ) : (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2
              size={18}
              className="mt-0.5 shrink-0 text-emerald-700"
            />

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-emerald-900">
                {photo.name}
              </p>

              <p className="mt-1 text-xs font-medium text-emerald-700">
                {(photo.size / 1024 / 1024).toFixed(2)} MB ·{" "}
                {photo.type === "image/jpeg" ? "JPG" : "PNG"}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-4">
                <label
                  htmlFor="photo"
                  className="cursor-pointer text-sm font-bold text-blue-700 transition hover:text-blue-900"
                >
                  Change photo
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setPhoto(null);
                    setError(null);

                    if (photoInputRef.current) {
                      photoInputRef.current.value = "";
                    }
                  }}
                  className="text-sm font-bold text-red-600 transition hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
</div>

          <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-bold text-blue-950">
                  Add this barrier to the map
                </p>

                <p className="mt-1 text-sm leading-6 text-blue-800">
                  If you are currently at the location, AccessMap can attach
                  your approximate coordinates to the report.
                </p>

                {form.latitude !== null &&
                  form.longitude !== null && (
                    <p className="mt-2 text-xs font-bold text-emerald-700">
                      Location captured successfully.
                    </p>
                  )}
              </div>

              <button
                type="button"
                onClick={useCurrentLocation}
                disabled={locating || submitting}
                className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {locating ? (
                  <>
                    <LoaderCircle
                      size={17}
                      className="animate-spin"
                    />
                    Locating...
                  </>
                ) : form.latitude !== null &&
                  form.longitude !== null ? (
                  <>
                    <CheckCircle2 size={17} />
                    Location added
                  </>
                ) : (
                  <>
                    <LocateFixed size={17} />
                    Use my location
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="mt-8 rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-bold text-slate-900">
              What happens next?
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              Your report enters the community feed as Submitted. An
              organization can then verify it, post progress updates, and mark
              it resolved.
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting || locating}
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            {submitting ? (
              <>
                <LoaderCircle
                  className="animate-spin"
                  size={18}
                />
                Submitting report...
              </>
            ) : (
              <>
                <Send size={18} />
                Submit report
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}

const inputStyles =
  "min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

function Field({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="grid gap-2">{children}</div>;
}

function Label({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-sm font-bold text-slate-900"
    >
      {children}
    </label>
  );
}

function HelpText({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <p className="text-xs leading-5 text-slate-500">
      {children}
    </p>
  );
}