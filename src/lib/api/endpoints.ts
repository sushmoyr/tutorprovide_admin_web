export const endpoints = {
  // Auth
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  REFRESH_TOKEN: "/auth/refresh",

  // Dashboard
  DASHBOARD: "/dashboard",
  DASHBOARD_TUITION_COUNT: "/dashboard/admin/tuition-count",
  DASHBOARD_TUTOR_COUNT: "/dashboard/admin/tutor-count",
  DASHBOARD_GUARDIAN_COUNT: "/dashboard/admin/guardian-count",

  // Users
  USERS: "/users",
  userById: (id: string | number) => `/users/${id}`,
  TUTORS: "/tutors",
  tutorById: (id: string | number) => `/tutors/${id}`,
  GUARDIANS: "/guardians",
  guardianById: (id: string | number) => `/guardians/${id}`,
  EMPLOYEES: "/employees",
  employeeById: (id: string | number) => `/employees/${id}`,

  // Tuitions
  TUITIONS: "/tuitions",
  tuitionById: (id: string | number) => `/tuitions/${id}`,
  APPOINTMENTS: "/tuitions/appointments",
  appointmentById: (id: string | number) => `/tuitions/appointments/${id}`,
  DEMO_CLASSES: "/tuitions/demo-class",
  demoClassById: (id: string | number) => `/tuitions/demo-class/${id}`,

  // Posts
  POSTS: "/posts",
  postById: (id: string | number) => `/posts/${id}`,

  // Invoices & Payments
  INVOICES: "/invoices",
  invoiceById: (id: string | number) => `/invoices/${id}`,
  PAYMENTS: "/payments",
  paymentById: (id: string | number) => `/payments/${id}`,

  // Location Configuration
  DIVISIONS: "/divisions",
  divisionById: (id: string | number) => `/divisions/${id}`,
  DISTRICTS: "/districts",
  districtById: (id: string | number) => `/districts/${id}`,
  AREAS: "/areas",
  areaById: (id: string | number) => `/areas/${id}`,
  LOCATIONS: "/living-locations",
  locationById: (id: string | number) => `/living-locations/${id}`,

  // Education Configuration
  CATEGORIES: "/categories",
  categoryById: (id: string | number) => `/categories/${id}`,
  CLASSES: "/classes",
  classById: (id: string | number) => `/classes/${id}`,
  SUBJECTS: "/subjects",
  subjectById: (id: string | number) => `/subjects/${id}`,
  CURRICULUM: "/curriculum",
  curriculumById: (id: string | number) => `/curriculum/${id}`,

  // Employee Configuration
  DEPARTMENTS: "/departments",
  departmentById: (id: string | number) => `/departments/${id}`,
  DESIGNATIONS: "/designations",
  designationById: (id: string | number) => `/designations/${id}`,

  // Roles & Permissions
  ROLES: "/roles",
  roleById: (id: string | number) => `/roles/${id}`,
  PERMISSIONS: "/permissions",
  permissionById: (id: string | number) => `/permissions/${id}`,

  // Content Management
  BLOGS: "/blogs",
  blogBySlug: (slug: string) => `/blogs/${slug}`,
  blogStatus: (slug: string, status: string) => `/blogs/${slug}/${status}`,
  BLOG_CATEGORIES: "/blogs/categories",
  blogCategoryById: (id: string | number) => `/blogs/categories/${id}`,
  TAGS: "/tags",
  FAQS: "/faq",
  faqById: (id: string | number) => `/faq/${id}`,
  GALLERIES: "/configurations/gallery",
  galleryById: (id: string | number) => `/configurations/gallery/${id}`,
  BANNERS: "/configurations/banners",
  bannerById: (id: string | number) => `/configurations/banners/${id}`,
  ADS: "/ads",
  adById: (id: string | number) => `/ads/${id}`,
  adStatus: (id: string | number, status: string) => `/ads/${id}/${status}`,
  ANNOUNCEMENTS: "/announcements",
  ANNOUNCEMENTS_MANAGEMENT: "/announcements/management",
  announcementById: (id: string | number) => `/announcements/${id}`,
  announcementPublish: (id: string | number) => `/announcements/${id}/publish`,
  PARTNERS: "/configurations/partners",
  partnerById: (id: string | number) => `/configurations/partners/${id}`,
  COUNTERS: "/configurations/static-counter",
  counterById: (id: string | number) => `/configurations/static-counter/${id}`,
  WELCOME_GREETINGS: "/configurations/welcome-greetings",
  welcomeGreetingById: (id: string | number) => `/configurations/welcome-greetings/${id}`,
  WALKTHROUGHS: "/configurations/walkthrough",
  walkthroughByKey: (key: string) => `/configurations/walkthrough/${key}`,

  // Feedback
  FEEDBACKS: "/feedbacks",
  feedbackById: (id: string | number) => `/feedbacks/${id}`,
  feedbackStatus: (id: string | number, status: string) => `/feedbacks/${id}/${status}`,

  // Service Charges
  SERVICE_CHARGES: "/configurations/service-charges",

  // Teams (legacy)
  TEAMS: "/teams",
  teamById: (id: string | number) => `/teams/${id}`,

  // Video Tutorials (legacy)
  VIDEO_TUTORIALS: "/video-tutorials",
  videoTutorialById: (id: string | number) => `/video-tutorials/${id}`,

  // Terms & Policies (legacy)
  TERMS: "/terms",
  termById: (id: string | number) => `/terms/${id}`,
  POLICIES: "/policies",
  policyById: (id: string | number) => `/policies/${id}`,

  // File Upload
  FILE_UPLOAD_MULTIPLE: "/files/upload/multiple",

  // Premium & Verification
  PREMIUMS: "/applications/premium-tutor",
  premiumById: (id: string | number) => `/applications/premium-tutor/${id}`,
  VERIFICATIONS: "/applications/tutor-verification",
  verificationById: (id: string | number) => `/applications/tutor-verification/${id}`,

  // Settings & Coupons
  SETTINGS: "/settings",
  COUPONS: "/coupons",
  couponById: (id: string | number) => `/coupons/${id}`,

  // File Upload
  FILE_UPLOAD: "/upload",

  // Profile
  PROFILE: "/profile",

  // Audit
  AUDIT_SNAPSHOTS: "/audit/snapshots",
  auditEntitySnapshots: (entityType: string, entityId: string | number) =>
    `/audit/snapshots/${entityType}/${entityId}`,
  auditEntityChanges: (entityType: string, entityId: string | number) =>
    `/audit/changes/${entityType}/${entityId}`,
} as const;
