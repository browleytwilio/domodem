export interface StoreHours {
  "mon-thu": string;
  "fri-sat": string;
  sun: string;
}

export interface Store {
  id: string;
  name: string;
  address: string;
  suburb: string;
  state: string;
  postcode: string;
  phone: string;
  lat: number;
  lng: number;
  hours: StoreHours;
  features: ("delivery" | "pickup" | "dine-in")[];
  deliveryRadius: number;
  image?: string;
  isOpen?: boolean;
}
