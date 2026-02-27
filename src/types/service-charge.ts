export type ServiceType = "TUTOR_VERIFICATION" | "TUTOR_PREMIUM";

export interface ServiceCharge {
  serviceType: ServiceType;
  charge: number;
}
