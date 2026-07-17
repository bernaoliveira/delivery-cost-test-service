export interface DeliveryOption {
  providerId: string;
  providerName: string;
  price: number;
  currency: string;
  estimatedDays: {
    min: number;
    max: number;
  };
}
