export interface IContact {
  name: {
    formatted_name: string;
    first_name?: string;
    last_name?: string;
  };
  phones: Array<{
    phone: string;
    wa_id?: string;
    type?: "CELL" | "MAIN" | "HOME" | "WORK";
  }>;
}

export default interface ISendContactMessageDTO {
  to: string;
  contacts: IContact[];
  entity_id: string;
  force_official_provider?: boolean;
}
