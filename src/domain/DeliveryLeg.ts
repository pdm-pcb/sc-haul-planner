export type LocationId = string;

export type BoxSize = 1 | 2 | 4 | 8 | 16 | 24 | 32;

export interface BoxStack {
  size: BoxSize;
  count: number;
}

export interface DeliveryLeg {
  id: string;
  pickup: LocationId;
  destination: LocationId;
  commodity: string;
  totalScu: number;
  maxBoxSize: BoxSize;
  notes?: string;
  createdAt: string;
}

export interface DestinationCargoLine {
  pickup: LocationId;
  destination: LocationId;
  commodity: string;
  boxes: BoxStack[];
  totalScu: number;
}

export interface DestinationGroup {
  destination: LocationId;
  cargoLines: DestinationCargoLine[];
  totalScu: number;
}