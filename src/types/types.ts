export interface SoloFormData {
  fullName: string;
  email: string;
  contactNo: string;
  contactNo2: string;
  institute: string;
  year: string;
  level: string;
  age: string;
  gender: string;
  stream: string;
  price: string;
  events: string[];
}

export interface TeamMember {
  name: string;
  role: string;
}

export interface cashfreeResponse {
  message: string;
  data: {
    customer_details: {
      customer_name: string;
      country_code: string;
      customer_phone: number;
      customer_email: string;
    };
    link_qrcode: string;
    link_purpose: string;
    isUsed: boolean;
    createdAt: string;
    _id: string;
    updatedAt: string;
    __v: number;
    link_status: string;
    link_url: string;
  };
}

export interface TeamFormData {
  fullName: string;
  teamName: string;
  email: string;
  contactNo: string;
  contactNo2: string;
  institute: string;
  year: string;
  level: string;
  teamLeader: string;
  members: number;
  gender: string;
  age: string;
  domain: string;
  member: TeamMember[];
  stream: string;
  events: string;
}

export interface SoloRegistrationResponse {
  message: string;
  data: {
    fullName: string;
    stream: string;
    email: string;
    contactNo: number;
    contactNo2: number;
    institute: string;
    year: string;
    level: string;
    events: string;
    age: string;
    qrString: string;
    // ticket: string;
    payment_url: string; //payemt.com //?event_name=‘’&fees=‘’&email=''
    isUsed: boolean;
    createdAt: string;
    _id: string;
    updatedAt: string;
    __v: number;
  };
  events: string;
  gender: string;
}
