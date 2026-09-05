export interface Office {
    id: string;
    name: string;
    timezone: string;
  }
  
  export interface Feature {
    code: string;
    name: string;
  }
  
  export interface Room {
    id: string;
    officeId: string;
    name: string;
    floor: number;
    capacity: number;
    features: Feature[];
  }