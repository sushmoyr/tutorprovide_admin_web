# Migration Checklist — Vue.js to Next.js

> Tracking all pages from the Vue.js admin panel (`tutorprovide-admin`) that need migration to the Next.js app (`tutorprovide_admin_web`).

---

## Authentication

- [x] Admin/Employee Login (`/login`)

## Dashboard

- [x] Dashboard Home (`/`)
- [ ] Admin Suggestions (`/suggest`)

## Tuition Management

- [ ] Pending Tuitions (`/pending/tuition`)
- [ ] Live Tuitions (`/live/tuition`)
- [ ] Cancelled Tuitions (`/cancel/tuition`)
- [ ] Shortlisted Tuitions (`/shortlist/tuition`)
- [ ] Appointed Tuitions (`/appoint/tuition`)
- [ ] Confirmed Tuitions (`/confirm/tuition`)

## Tuition Posts

- [ ] Posts List (`/posts`)
- [ ] Create Post (`/posts/create`)
- [ ] Edit Post (`/posts/edit/:id`)
- [ ] Post Details (`/posts/details/:id`)
- [ ] Guardian Post Details (`/posts/guardian/details/:id`)
- [ ] Applied Tutors (`/applied/tutor`)
- [ ] Post Payment Edit (`/post/payment/:id/edit`)

## Users — Guardians

- [ ] Guardians List (`/guardians`)
- [ ] Create Guardian (`/guardians/create`)
- [ ] Guardian Details (`/guardian/details/:id`)
- [ ] Edit Guardian Details (`/guardian/details/edit/:id`)
- [ ] Male Guardians (`/male/guardians`)
- [ ] Female Guardians (`/female/guardians`)
- [ ] Guardian Profile (`/guardian/profile`)
- [ ] Guardian Profile Update (`/guardian/profile/update`)

## Users — Tutors

- [ ] Tutors List (`/tutors`)
- [ ] Create Tutor (`/tutors/create`)
- [ ] Tutor Details (`/user/tutor/details/:id`)
- [ ] Edit Tutor Details (`/user/tutor/details/edit/:id`)
- [ ] Download Tutor CV (`/user/tutor/cv/:id`)
- [ ] Male Tutors (`/male/tutors`)
- [ ] Female Tutors (`/female/tutors`)
- [ ] Tutor Profile (`/tutor/profile`)
- [ ] Tutor Profile CV (`/tutor/profile/cv`)
- [ ] Tutor Profile Update (`/tutor/profile/update`)

## Users — Employees

- [ ] Employees List (`/employees`)
- [ ] Create Employee (`/employees/create`)
- [ ] Employee Details (`/employee/details/:id`)
- [ ] Edit Employee (`/employee/update/:id`)

## Users — General

- [ ] Users List (`/users`)
- [ ] Create User (`/users/create`)
- [ ] Edit User (`/users/edit/:id`)
- [ ] Premium Requests List (`/users/premium/request`)
- [ ] Premium Request Details (`/users/premium/request/details/:id`)
- [ ] Verification Requests List (`/users/verification/request`)
- [ ] Verification Request Details (`/users/verification/request/details/:id`)

## User History & Invoices

- [ ] Tutor Invoice List (`/tutor/invoice-list/:id`)
- [ ] Tuition History List (`/tuition/history/:id`)
- [ ] Tuition History Details (`/tuition/history/:id/:status`)
- [ ] Tutoring History List (`/tutor/tutoring/histories/:id`)
- [ ] Tutoring History Details (`/tutoring/history/:id/:status`)

## Invoices

- [ ] Invoices List (`/invoices/management`)
- [ ] Edit Invoice (`/invoices/edit/:id`)
- [ ] Invoice Details (`/invoices/show/:id`)
- [ ] Tuition Invoices (`/tuition/invoices`)
- [ ] Create Invoice by User (`/application/invoices/create/:id`)

## Payments

- [ ] Payments List (`/payments`)
- [ ] Edit Payment (`/payments/edit/:id`)
- [ ] Payment Details (`/payments/show/:id`)

## Address Configuration

- [x] Divisions (`/divisions`)
- [x] Districts (`/districts`)
- [x] Areas (`/areas`)
- [x] Living Locations (`/living/locations`)

## Tuition Configuration

- [x] Categories (`/categories`)
- [x] Curriculums (`/curriculums`)
- [x] Preferable Classes (`/classes`)
- [x] Subjects (`/subjects`)

## Employee Configuration

- [x] Departments (`/departments`)
- [x] Designations (`/designations`)

## Roles & Permissions

- [x] Permissions List (`/permissions`)
- [x] Roles List (`/roles`)
- [x] Create Role (dialog in `/roles`)
- [x] Edit Role (dialog in `/roles`)

## Updates & Notifications

- [ ] Updates List (`/updates`)
- [ ] Employee Updates (`/employee/updates`)
- [ ] Update Appointments Details (`/updates/details/appoints/show/:id`)
- [ ] Update Confirmations Details (`/updates/details/confirm/show/:id`)

## Banners

- [x] Banners List (`/banners`)
- [x] Create Banner (`/banner/create`)
- [x] Edit Banner (`/banner/edit/:id`)

## Counters

- [x] Counters List (`/counters`)
- [x] Create Counter (dialog)
- [x] Edit Counter (dialog)

## Partners

- [x] Partners List (`/partners`)
- [x] Create Partner (`/partner/create`)
- [x] Edit Partner (`/partner/edit/:id`)

## Welcome Greetings

- [x] Welcome Greetings List (`/welcome-greetings`)
- [x] Create Welcome Greeting (dialog in `/welcome-greetings`)
- [x] Edit Welcome Greeting (dialog in `/welcome-greetings`)

## Walkthroughs

- [x] Walkthroughs List (`/walkthroughs`)
- [x] Create Walkthrough (dialog in `/walkthroughs`)
- [x] Edit Walkthrough (dialog in `/walkthroughs`)

## Notices

- [x] Notices List (`/notices`)
- [x] Create Notice (dialog in `/notices`)
- [x] Edit Notice (dialog in `/notices`)

## Advertisements

- [x] Ads List (`/ads`)
- [x] Create/Edit Ad (dialog in `/ads`)

## Blogs

- [x] Blogs List (`/blogs`)
- [x] Create Blog (dialog in `/blogs`)
- [x] Edit Blog (dialog in `/blogs`)
- [ ] Blog Details (`/blog/details/:slug`)
- [ ] Blogs by Tag (`/tag/blogs/:tag`)
- [x] Blog Categories (`/blog-categories`)

## Galleries

- [x] Galleries List (`/galleries`)
- [x] Create Gallery (dialog in `/galleries`)
- [x] Edit Gallery (dialog in `/galleries`)

## FAQs

- [x] FAQs List (`/faqs`)
- [x] Create/Edit FAQ (dialog in `/faqs`)

## Feedback

- [x] Feedback List (`/feedbacks`)
- [x] Edit Feedback (dialog in `/feedbacks`)

## Coupons

- [x] Coupons List (`/coupons`)
- [x] Create/Edit Coupon (dialog in `/coupons`)

## Settings & Welcome Modals

- [x] Settings / Service Charges (`/settings`)
- [x] Welcome Home Modals (via Welcome Greetings type filter)
- [x] Welcome Backend Modals (via Welcome Greetings type filter)

## Content — Terms & Policies

- [x] Terms List (`/terms`)
- [x] Create/Edit Term (dialog in `/terms`)
- [x] Policies List (`/policies`)
- [x] Create/Edit Policy (dialog in `/policies`)

## Content — Video Tutorials

- [x] Video Tutorials List (`/video-tutorials`)
- [x] Create/Edit Video Tutorial (dialog in `/video-tutorials`)

## Team

- [x] Team Members List (`/teams`)
- [x] Create/Edit Team Member (dialog in `/teams`)

## Profile & Security

- [ ] Admin Profile (`/profile`)
- [ ] Profile Update (`/profile/update`)
- [ ] Password/Security (`/security`)

## Error Pages

- [ ] 404 Not Found

---

## Activity Log

- [x] Activity Log (`/activity-log`)

---

## Progress Summary

| Status | Count    |
|--------|----------|
| Done | ~58      |
| Remaining | ~76      |
| **Total** | **~134** |
