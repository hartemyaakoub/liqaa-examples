# Telehealth — doctor / patient platform

A production-grade telehealth pattern in **Laravel 12 + Livewire 3**. Patients book a slot; at the appointment time, both sides land in a HIPAA-aligned video room. The doctor can issue a prescription PDF mid-call.

## What's inside

```
telehealth/
├─ app/
│  ├─ Models/{Appointment, PatientFile, Prescription}.php
│  ├─ Livewire/
│  │  ├─ WaitingRoom.php       · "Doctor will join in N seconds"
│  │  ├─ Consultation.php      · the actual call + side panel
│  │  └─ Prescription.php      · doctor-only PDF generator
│  ├─ Http/Controllers/{SdkTokenController, WebhookController}.php
│  └─ Services/Liqaa/{Client, WebhookVerifier}.php
├─ resources/views/livewire/...
└─ database/migrations/...
```

## HIPAA-aligned defaults

We're not selling HIPAA compliance — that's a contract LIQAA Enterprise customers sign with the platform. But the **patterns** in this template are the ones a HIPAA-ready clinic should use:

- ✅ Recording disabled by default (require explicit `recordWithConsent=true`)
- ✅ All PHI lives in the doctor's database, never in URLs or LIQAA metadata
- ✅ Prescriptions: HMAC-signed PDF + audit log on every download
- ✅ Patient identifiers are surrogate keys (`patient_01HK7…`), not names or insurance IDs
- ✅ TLS 1.3 enforced (Laravel `\Url::forceScheme('https')`)
- ✅ Session timeout = 15 min; force re-auth before sensitive actions
- ✅ All admin actions logged to immutable append-only table

## Why Livewire + Laravel?

- Most independent clinics in MENA / Europe run on PHP. Laravel is the easiest Greenfield stack for a 1-doctor practice to self-host.
- Livewire 3 lets us build the live-updating waiting room without a JS framework war.
- The patterns translate cleanly to Symfony, Rails, or Django if you prefer.

## Run it

```bash
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

Visit `/patient/book` to book a slot; `/doctor/today` to see the queue.

## Webhook events handled

| Event | What we do |
| ----- | ---------- |
| `call.started` | mark `appointment.status = in_progress`, log to audit table |
| `call.ended` | compute duration, queue `BillInsurance` job, schedule follow-up reminder |
| `recording.ready` | (only if recording was consented) attach to encrypted patient file vault |

## What's deliberately **not** here

- No actual EMR integration — that's vendor-specific (Epic, Cerner, OpenEMR).
- No insurance API — varies wildly per region.
- No prescription drug interaction database — out of scope for a video example.
