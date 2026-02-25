# Migration Checklist — Vue.js to Next.js

> Tracking all pages from the Vue.js admin panel (`tutorprovide-admin`) that need migration to the Next.js app (`tutorprovide_admin_web`).

---

## Authentication

- [x] Admin Login (`/login`)
- [ ] Employee Login (`/employee/login`)

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

## Address Configuration

- [ ] Divisions (`/divisions`)
- [ ] Districts (`/districts`)
- [ ] Areas (`/areas`)
- [ ] Living Locations (`/living/locations`)

## Tuition Configuration

- [ ] Categories (`/categories`)
- [ ] Curriculums (`/curriculums`)
- [ ] Preferable Classes (`/classes`)
- [ ] Subjects (`/subjects`)
- [ ] Tuition Types List (`/tution/types`)
- [ ] Create Tuition Type (`/tution/types/create`)
- [ ] Edit Tuition Type (`/tution/types/edit/:id`)

## Employee Configuration

- [ ] Departments (`/departments`)
- [ ] Designations (`/designations`)

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

## Roles & Permissions

- [ ] Permissions List (`/permissions`)
- [ ] Roles List (`/roles`)
- [ ] Create Role (`/roles/create`)
- [ ] Edit Role (`/roles/edit/:id`)
- [ ] Role Details (`/roles/details/:id`)
- [ ] Role Management (`/roles/management`)

## Updates & Notifications

- [ ] Updates List (`/updates`)
- [ ] Employee Updates (`/employee/updates`)
- [ ] Update Appointments Details (`/updates/details/appoints/show/:id`)
- [ ] Update Confirmations Details (`/updates/details/confirm/show/:id`)

## Banners

- [x] Banners List (`/banners`)
- [ ] Create Banner (`/banner/create`)
- [ ] Edit Banner (`/banner/edit/:id`)

## Counters

- [x] Counters List (`/counters`)
- [x] Create Counter (dialog)
- [x] Edit Counter (dialog)

## Partners

- [ ] Partners List (`/partners`)
- [ ] Create Partner (`/partner/create`)
- [ ] Edit Partner (`/partner/edit/:id`)

## Welcome Greetings

- [ ] Welcome Greetings List (`/welcome-greetings`)
- [ ] Create Welcome Greeting (`/welcome-greetings/create`)
- [ ] Edit Welcome Greeting (`/welcome-greetings/edit/:id`)

## Walkthroughs

- [ ] Walkthroughs List (`/walkthroughs`)
- [ ] Create Walkthrough (`/walkthrough/create`)
- [ ] Edit Walkthrough (`/walkthrough/edit/:key`)

## Notices

- [ ] Notices List (`/notices`)
- [ ] Create Notice (`/notices/create`)
- [ ] Edit Notice (`/notices/edit/:id`)

## Advertisements

- [ ] Ads List (`/ads`)
- [ ] Advertisements (`/advertise`)

## Blogs

- [ ] Blogs List (`/blogs`)
- [ ] Create Blog (`/blogs/create`)
- [ ] Edit Blog (`/blogs/edit/:slug`)
- [ ] Blog Details (`/blog/details/:slug`)
- [ ] Blogs by Tag (`/tag/blogs/:tag`)
- [ ] Blog Categories (`/blog-categories`)

## Galleries

- [ ] Galleries List (`/galleries`)
- [ ] Create Gallery (`/galleries/create`)
- [ ] Edit Gallery (`/galleries/edit/:id`)

## FAQs

- [ ] FAQs List (`/faqs`)

## Feedback

- [ ] Feedback List (`/feedbacks`)
- [ ] Edit Feedback (`/feedbacks/edit/:id`)

## Coupons

- [ ] Coupons List (`/coupons`)

## Settings & Welcome Modals

- [ ] Settings (`/settings`)
- [ ] Welcome Home Modals List (`/welcome/homes`)
- [ ] Edit Welcome Home Modal (`/welcome/homes/edit/:id`)
- [ ] Welcome Backend Modals List (`/welcome/backends`)
- [ ] Edit Welcome Backend Modal (`/welcome/backends/edit/:id`)

## Content — Terms & Policies

- [ ] Terms List (`/terms`)
- [ ] Edit Term (`/edit/term/:id`)
- [ ] Policies List (`/policies`)
- [ ] Edit Policy (`/edit/policy/:id`)

## Content — Video Tutorials

- [ ] Video Tutorials List (`/video/tutorials`)
- [ ] Edit Video Tutorial (`/video/tutorials/edit/:id`)

## Team

- [ ] Team Members List (`/teams`)
- [ ] Edit Team Member (`/edit/team/:id`)

## Profile & Security

- [ ] Admin Profile (`/profile`)
- [ ] Profile Update (`/profile/update`)
- [ ] Password/Security (`/security`)

## Special Pages

- [ ] Live Chat (`/chats`)
- [ ] Push Notifications (`/push`)

## Error Pages

- [ ] 404 Not Found

---

## Progress Summary

| Status | Count |
|--------|-------|
| Done | 7 |
| Remaining | ~130 |
| **Total** | **~137** |
